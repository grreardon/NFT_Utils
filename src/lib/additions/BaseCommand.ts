import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import BetterClient from "../extensions/BetterClient";

export default class BaseCommand { 
   public name: string
   public data: SlashCommandBuilder;
   public client: BetterClient
    constructor(name: string, d: SlashCommandBuilder, client: BetterClient) {
        this.name = name;
        this.data = d;
        this.client = client;
    }

    //@ts-expect-error
    async execute(interaction: CommandInteraction): Promise<any> {};
}