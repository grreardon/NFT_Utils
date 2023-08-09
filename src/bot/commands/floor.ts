import { SlashCommandBuilder } from "@discordjs/builders"
import fetch from "node-fetch";
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class Floor extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("floor", new SlashCommandBuilder().setName("floor").setDescription("Displays floor data"), client);
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply();

        const data = await interaction.guild?.getSettings();
        //@ts-ignore
        if(!data.collection_slug) return interaction.editReply("No collection slug configured!");
         
        //@ts-ignore
        const fetchData = await fetch(`https://api.opensea.io/api/v1/collection/${data.collection_slug}/stats`, {method: "GET", "X-API-KEY": process.env.OSKEY || ""}).catch((err) => this.client.logger.logError(err));

        if(fetchData?.status == 404 || fetchData?.status == 400) await this.client.logger.logError(fetchData, __filename)
        if(fetchData?.status != 200) return interaction.editReply("Error getting data, most likely invalid collection slug.")

          
            const jsonData  = await fetchData.json();
          
            return interaction.editReply(`${+jsonData.stats.floor_price} ETH`)
          }
        }