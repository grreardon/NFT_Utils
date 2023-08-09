import BetterClient from "../../lib/extensions/BetterClient";
import { ColorResolvable, MessageEmbed, Snowflake } from "discord.js";
import fetch from "node-fetch";
export default class SalesJob {
    public client: BetterClient
    public name: string
    public interval: number
    public currentSlug: string
    public currentChannel: string
    public currentNumber: number 
    public currentGuild: Snowflake
    public next: any;
    public newEvents: boolean;
    public timeStamps: Map<string, { lastTimestamp: number}>
    public salesCache: Map<string, Set<any>>
    public rateLimited: boolean
    public counter: number
    public needed: number
    public hex: ColorResolvable
    public continue: boolean
    constructor(client: BetterClient) {
        this.client = client;
        this.name = "sales",
        this.interval = 7500;
        this.currentSlug = "";
        this.currentChannel = "";
        this.currentNumber = 0;
        this.currentGuild = "";
        this.next = null;
        this.newEvents = true;
        this.timeStamps = new Map()
       this.salesCache = new Map<string, Set<any>>();
       this.rateLimited = false;
       this.counter = 0;
       this.needed = 10;
       this.hex = "#a903fc";
       this.continue = true;
            }


    public async setCurrent() {
       const arr = Array.from(this.client.slugs.keys());
       if(!arr.length) return;
       if(!arr[this.currentNumber])  {
         this.currentNumber = 0;
       }
       const config = this.client.slugs.get(arr[this.currentNumber]);
        if(config) {
            this.currentGuild = arr[this.currentNumber];
            this.currentChannel = config.channel;
            this.currentSlug = config.slug;
            this.hex = config.hex;
    }
    }
    public async execute() {
        this.next = null;
        this.continue = true;
        await this.setCurrent();
          const arr = Array.from(this.client.slugs.keys());
          if(!arr.length) return;
        if(!this.timeStamps.has(this.currentGuild)) {
            this.timeStamps.set(this.currentGuild, {
              lastTimestamp: Math.floor(Date.now() / 1000) - 30,
            })
          } else {
            this.timeStamps.set(this.currentGuild, {
              //@ts-ignore
              lastTimestamp: this.timeStamps.get(this.currentGuild)?.lastTimestamp - 60, 
            }) 
          }
          const timestamp = this.timeStamps.get(this.currentGuild);
          if(this.rateLimited) {
            if(this.counter > this.needed) {
              this.rateLimited = false;
            } else {
              this.counter++;
            }
            return;
          }
          if(!timestamp) return;
            do {
                const data = await fetch(`https://api.opensea.io/api/v1/events?collection_slug=${this.currentSlug}&event_type=successful&only_opensea=false&occurred_after=${timestamp.lastTimestamp}${this.next == null ? "" : `&cursor=${this.next}`}`, {"method": "get", "headers": {"X-API-KEY": process.env.OSKEY || ""}}).catch((err) => this.client.logger.logError(err, __filename));
                if(!data) break;
                if(data && data.status !== 200) {
                    if(data.status !== 429) this.client.slugs.delete(arr[this.currentNumber]);
                    else {
                      this.counter = 0;
                      this.needed *= 10;
                      this.client.logger.logError("Ratelimited with Opensea...", __filename)
                      this.rateLimited = true;
                    }
                    break;
                } 
                const newData = await data.json();
                this.next = newData.next;
                for(let event of newData.asset_events) {
                    try {
                    const set = this.salesCache.get(`${this.currentGuild}-${this.currentSlug}`) || new Set()
                   if(set?.has(event.id)) {
                   this.continue = false;
                     break;
                    } else {
                     set?.add(event.id)
                     if((set?.size || 0)> 100) set?.delete([...set][set?.size - 1])
                     this.salesCache.set(`${this.currentGuild}-${this.currentSlug}`, set);
                    }
                    if (event.asset) {
                          const embedMsg = new MessageEmbed()
                          .setColor(this.hex)
                         .setTitle(event.asset.name || "N/A Asset Name")
                          .setURL(event.asset.permalink || "https://opensea.io")
                          .setDescription(`has just been sold for ${event.total_price / (1e18)} ETH (~$${Math.round(event.total_price / (1e18) * 3000)} USD)`)
                          .setImage(event.asset.image_url || "")
                          .addField("From", `[${(event.seller.user?.username || event.seller.address.slice(0, 8)) || "Unknown"}](https://etherscan.io/address/${event.seller.address || "Unknown"})`, true)
                          .addField("To", `[${(event.winner_account.user?.username || event.winner_account.address.slice(0, 8)) || "Unknown"}](https://etherscan.io/address/${event.winner_account.address || "Unknown"})`, true)
                          .setFooter(`NFT Utils by @gegthedev`)           
                      const guild = await this.client.guilds.fetch(this.currentGuild).catch(() => {});
                      if(!guild) {
                        this.client.slugs.delete(arr[this.currentNumber]);
                        this.continue = false;
                        break;
                      }
                      const channel =await guild.channels.fetch(this.currentChannel).catch(() => {})
                        if(!channel) {
                          this.client.slugs.delete(arr[this.currentNumber]);
                          this.continue = false;
                          break;
                        } else {
                        //@ts-ignore
                      channel.send({embeds: [embedMsg]}).catch(() => {
                        this.client.slugs.delete(arr[this.currentNumber]);
                      })
                        }
                        }
                    } catch (error) {
                    this.client.logger.logError(error, __filename)
                  }
                }

                
            } while(this.next != null && !this.rateLimited && this.continue)

            this.timeStamps.set(this.currentGuild, {
              lastTimestamp: Math.floor(Date.now() / 1000),
            });
            this.currentNumber++;
        ;
    }
};