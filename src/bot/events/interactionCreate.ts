import { Interaction } from "discord.js";
import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";


export default class InteractionCreate extends BaseEvent {
    constructor(client: BetterClient) {
        super(client, "interactionCreate")
    }

    override async execute(interaction: Interaction) {
        if(interaction.isCommand()) {
            const command = this.client.commands.get(interaction.commandName);
            if(command) {
                if(!interaction.guild) return interaction.reply("");
                return await command.execute(interaction);
            }
        }
    }
}