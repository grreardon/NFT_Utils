import { SlashCommandBuilder } from "@discordjs/builders"
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";
import fetch from "node-fetch"
import { guildSettings } from "../../lib/types";
import { MessageEmbed } from "discord.js"

export default class Asset extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("asset", new SlashCommandBuilder().setName("asset").setDescription("Gather data about an asset.").addStringOption((option) => option.setName("assetname").setDescription("The asset you want the data from.").setRequired(true)), client);
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply();
        if(!interaction.guild) return interaction.editReply("Needs to be in a guild.")
        //@ts-ignore
        const guildData: guildSettings = await interaction.guild?.getSettings();

        if(!guildData.collection_slug) return interaction.editReply("This server does not have their collection slug configured!")

        const assetString = interaction.options.getString("assetname")
        const fetchData = await fetch(`https://api.opensea.io/api/v1/assets?collection_slug=${guildData.collection_slug}&token_ids=${assetString}`, {"method": "get", "headers": {"X-API-KEY": process.env.OSKEY || ""}});
        if(fetchData.status !== 200) return interaction.editReply("Asset not found!") 
        
        const data = await fetchData.json();
        const asset = data.assets[0];
        if(!asset) return interaction.editReply("Asset not found!")

        const embed = new MessageEmbed()
        .setTitle(asset.name || "N/A")
        .setURL(asset.permalink || "N/A")
        .setDescription(`Owner: ${(asset.owner.user?.username || asset.owner.address.slice(0,8) || "N/A")}`)
        .setImage(asset.image_url)
        .setFooter("NFT Utils by @gegthedev")
        //@ts-ignore
        .setColor(guildData?.hex ?? "WHITE")
        for(let i = 0; i < asset.traits.length; i++) {
            if(i >= 25) break;
            const trait = asset.traits[i];
            embed.addField(trait.trait_type, trait.value, true)
        }

        return await interaction.editReply({embeds: [embed]}).catch((err) => this.client.logger.logError(err, __filename))

}
}