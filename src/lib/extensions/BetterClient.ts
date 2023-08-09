import { Client, ClientOptions, ColorResolvable, Snowflake } from "discord.js";
import DataManager from "../additions/DataManager";
import Logger from "../additions/Logger";
import { readdirSync} from "fs"
import BaseCommand from "../additions/BaseCommand";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { REST } from "@discordjs/rest"
import BaseEvent from "../additions/BaseEvent";
import SalesJob from "../../bot/cronjobs/sales";

export default class BetterClient extends Client {

    dataManager: DataManager;
    logger: Logger
    commands: Map<string, BaseCommand>
    commandData: RESTPostAPIApplicationCommandsJSONBody[];
    public restData: REST | null;
    public slugs: Map<Snowflake, {
        slug: string, 
        channel: string,
        hex: ColorResolvable
    }>;
    public jobs: Map<string, SalesJob>
    constructor(options: ClientOptions) {
        super(options);
        //@ts-ignore
        this.dataManager = new DataManager({uri: process.env.DB, mongoData: {}, redisData: {}}, this);
        this.logger = new Logger(this);
        this.commands = new Map<string, BaseCommand>();
        this.commandData = [];
        this.restData = null;
        this.slugs = new Map<Snowflake, {slug: string, channel: string, hex: ColorResolvable}>();
        this.jobs = new Map<string, SalesJob>();
    }

    override login(token: string | undefined) {
        this.dataManager.login().then(() => console.log("Logged into DB")).catch(err => console.log(err)); 
        this.dataManager.cacheManager.cache.flushall();;
        this.loadEvents();
        return super.login(token);
    }

    public async initSales() {
       const entries = await this.dataManager.dbManager.getMultiple("guilds", {});
       if(entries) (await entries?.toArray()).forEach(async (entry) => {
           if(!entry.disabled) {
              if(entry.collection_slug && entry.salesChannel) this.slugs.set(entry._id.toString(), { slug: entry.collection_slug,  channel: entry.salesChannel, hex: entry.hex || "#a903fc"})
           }
       })

    }

    public async loadJobs() {
        readdirSync(`${__dirname}/../../bot/cronjobs`).forEach(async (file) => {
            if(file.endsWith("js")) {
                const commandFile = await import(`../../bot/cronjobs/${file}`);
                const job = new commandFile.default(this);
                this.jobs.set(job.name, job);
                console.log(`Initialized ${job.name}`)
                setInterval(async () => {
                  await  job.execute()
                }, job.interval)
            }
        });
    }
    public async loadCommands() {
       readdirSync(`${__dirname}/../../bot/commands`).forEach(async (file) => {
           if(file.endsWith("js")) {
               const commandFile = await import(`../../bot/commands/${file}`);
               const command: BaseCommand = new commandFile.default(this);
               this.commands.set(command.name, command);
               //@ts-ignore
               this.commandData.push(command.data.toJSON());
           }
       });
       try {
		console.log('Started refreshing application (/) commands.');

        setTimeout(async () => {
        this.restData = new REST({ version: '9' }).setToken(this.token ?? "a");
		if(process.env.ENVIRONMENT == "dev") await this.restData.put(
			Routes.applicationGuildCommands(this?.user?.id || "", process.env.GUILD || ""),
			{ body: this.commandData },
		);
        else {
            console.log("In prod")
            await this.restData.put(
                Routes.applicationCommands(this?.user?.id || ""),
                { body: this.commandData },
            );
        }
		console.log('Successfully reloaded application (/) commands.');
    }, 1000);
	} catch (error) {
		this.logger.logError(error, __filename)
	}
    }

    public async loadEvents() {
        readdirSync(`${__dirname}/../../bot/events`).forEach(async (file) => {
            if(file.endsWith("js")) {
                const eventFile = await import(`../../bot/events/${file}`);
                const event: BaseEvent = new eventFile.default(this);
                this.on((event.name), (...args) => event.execute(...args));
                console.log(`loaded ${event.name}`)
            }
        });
    }

}