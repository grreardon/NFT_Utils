import { Message, MessagePayload, ReplyMessageOptions } from "discord.js";
import { RawMessageData } from "discord.js/typings/rawDataTypes";
import BetterClient from "./BetterClient";

export default class BetterMessage extends Message {
    
    public constructor(client: BetterClient, data: RawMessageData) {
        super(client, data);
    }

    public override async reply(
        options: string | MessagePayload | ReplyMessageOptions
    ): Promise<BetterMessage> {
        try {
            if (this.deleted) return await this.channel.send(options);
            else return await super.reply(options);
        } catch {
            return this.channel.send(options);
        }
    }
}

