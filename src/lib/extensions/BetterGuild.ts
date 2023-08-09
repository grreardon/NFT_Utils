import { Guild } from "discord.js";
import { RawGuildData } from "discord.js/typings/rawDataTypes";
import { guildSettings } from "../types";
import BetterClient from "./BetterClient"
export default class BetterGuild extends Guild {
    declare client: BetterClient;
    constructor(client: BetterClient, data: RawGuildData) {
        super(client, data);
    }

    public async getSettings(): Promise<guildSettings | {}> {
        return await this.client.dataManager.get("guilds", this.id, "guild")
    }

    public async setSettings(settings: guildSettings) {
        await this.client.dataManager.set("guilds", {_id: this.id}, {...settings, _id: this.id},  "guild");
    }
}

