import { SlashCommandBuilder } from "@discordjs/builders"
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class Config extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("config", new SlashCommandBuilder().setName("config").setDescription("Shows the current configuration"), client);
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply();
        if(!interaction.guild?.id) return interaction.editReply("")
        if(!interaction.memberPermissions?.has("ADMINISTRATOR")) return interaction.editReply("You need the `ADMINISTRATOR` permission to run this command!")
        const data = await interaction.guild.getSettings()

        return interaction.editReply(`\`\`\`${Object.entries(data).join("\n").replaceAll(",", ": ") || "Nothing configured"}\`\`\``)
        }
}