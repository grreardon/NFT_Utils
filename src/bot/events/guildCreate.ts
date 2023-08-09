import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";
import BetterGuild from "../../lib/extensions/BetterGuild";

export default class GuildCreate extends BaseEvent {
    
    constructor(client: BetterClient) {
        super(client, "guildCreate")
    }

    override async execute(guild: BetterGuild) {
        await this.client.logger.logGuild(guild)
}
}