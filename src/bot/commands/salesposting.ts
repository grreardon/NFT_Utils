import { SlashCommandBuilder } from "@discordjs/builders"
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class SalesPosting extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("salesposting", new SlashCommandBuilder().setName("salesposting").setDescription("Change sales posting").addBooleanOption(option => option.setName("disabled").setDescription("Whether or not to have sales posting enabled. `false` by default.").setRequired(true)), client)
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply({ephemeral: true});
        if(!interaction.guild?.id) return interaction.editReply("")
        if(!interaction.memberPermissions?.has("ADMINISTRATOR")) return interaction.editReply("You need the `ADMINISTRATOR` permission to run this command!")
        const disabled = interaction.options.getBoolean("disabled");
        const guildSettings = await interaction.guild.getSettings();

        //@ts-ignore
        const collection_slug = guildSettings?.collection_slug
        //@ts-ignore
        const salesChannel = guildSettings?.salesChannel
        if(!collection_slug || !salesChannel) return await interaction.editReply("You can't enable / disable this module without your salesChannel & collection slug setup!")
        if(disabled) {
            await this.client.dataManager.set("guilds", {_id: interaction.guild?.id}, {disabled }, "guilds");
            if(this.client.slugs.has(interaction.guild.id)) {
                this.client.slugs.delete(interaction.guild.id)
            }
        }
        else {
            await this.client.dataManager.set("guilds", {_id: interaction.guild?.id}, { disabled }, "guilds")
            //@ts-ignore
                this.client.slugs.set(interaction.guild.id, {slug: collection_slug, channel: salesChannel, hex: guildSettings?.hex || "#a903fc"})
        }

        return interaction.editReply("Sucessfully changed your sales posting data to " + disabled)
    }
}
