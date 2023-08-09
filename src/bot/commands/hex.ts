import { SlashCommandBuilder } from "@discordjs/builders"
import { ColorResolvable } from "discord.js";
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";

export default class Hex extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("hex", new SlashCommandBuilder().setName("hex").setDescription("Change the hex color ").addStringOption(option => option.setName("color").setDescription("The hex color you want your embeds to be changed to").setRequired(true)), client);
        this.client = client;
    }

    public override async execute(interaction: BetterCommandInteraction): Promise<any> {
        await interaction.deferReply({ephemeral: true})
        const hex = interaction.options.getString("color");
        if(!hex) return await interaction.editReply("No hex");

        if(!interaction.guild?.id) return await interaction.editReply("No guild")
        const regex =/[0-9A-Fa-f]{6}/g
        //@ts-ignore
        const {collection_slug, disabled, salesChannel} = await interaction.guild.getSettings()
        if(regex.test(hex)) {
            await this.client.dataManager.set("guilds", {_id: interaction.guild.id}, {hex}, "guilds");
            if(collection_slug && salesChannel && !disabled) await this.client.slugs.set(interaction.guild.id, { slug: collection_slug, channel: salesChannel, hex: hex as ColorResolvable})
            return interaction.editReply("Changed the hex code!")
        } else {
            return interaction.editReply("Invalid hex")
        }
    }
        }