import { GuildMember } from "discord.js";
import { RawGuildMemberData } from "discord.js/typings/rawDataTypes";
import BetterClient from "./BetterClient";
import BetterGuild from "./BetterGuild";


export default class BetterMember extends GuildMember {

    constructor(client: BetterClient, data: RawGuildMemberData, guild: BetterGuild) {
        super(client,data, guild);
    }
}


