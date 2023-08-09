import { SlashCommandBuilder } from "@discordjs/builders"
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class Setup extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("setup", new SlashCommandBuilder().setName("setup").setDescription("Setup the sales channel.").addChannelOption((option) => option.setName("channel").setDescription("The channel you want sales data posted to").setRequired(true)), client);
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply({ephemeral: true});
        if(!interaction.memberPermissions?.has("ADMINISTRATOR")) return interaction.editReply("You need the `ADMINISTRATOR` permission to run this command!")
        //@ts-ignore
        const {collection_slug, disabled, hex} = await interaction.guild.getSettings()
        if(!collection_slug) return  interaction.editReply("You need to set up your collection slug! Do this by using `/collection_slug <slug>`.");
        const channel = interaction.options.getChannel("channel");
        if(!channel) return await interaction.editReply("Invalid channel.");
        if(channel.type !== "GUILD_TEXT") return interaction.editReply("Wrong type of channel.")
       
        await this.client.dataManager.set("guilds", {_id: interaction.guild?.id}, { salesChannel: channel.id}, "guilds").catch(err => this.client.logger.logError(err, __filename));
       if(interaction.guild?.id && !disabled) this.client.slugs.set(interaction.guild?.id, { slug: collection_slug, channel: channel.id, hex: hex || "#a903fc"});
        return interaction.editReply("Sucessfully updated the sales channel!")
    }
}
