import { SlashCommandBuilder } from "@discordjs/builders"
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class CollectionSlug extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("collection_slug", new SlashCommandBuilder().setName("collection_slug").setDescription("Setup the collection slug.").addStringOption((option) => option.setName("slug").setDescription("Your collections slug.").setRequired(true)), client);
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply({ephemeral: true});
        if(!interaction.guild?.id) return interaction.editReply("")
        if(!interaction.memberPermissions?.has("ADMINISTRATOR")) return interaction.editReply("You need the `ADMINISTRATOR` permission to run this command!")
        const slug = interaction.options.getString("slug");
        if(!slug || slug.length > 32) return interaction.editReply("Invalid slug.");
       
        await this.client.dataManager.set("guilds", {_id: interaction.guild?.id}, { collection_slug: slug}, "guilds").catch(err => this.client.logger.logError(err, __filename));
        //@ts-ignore
        const { salesChannel, disabled, hex } = await interaction.guild!.getSettings();
        if(salesChannel && !disabled) await this.client.slugs.set(interaction.guild!.id, { slug, channel: salesChannel, hex: hex || "#a903fc"});
        return interaction.editReply("Sucessfully updated the collection slug. Please ensure that this is correct, or the bot will not function properly.")
    }
}