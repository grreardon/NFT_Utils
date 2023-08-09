import chalk from 'chalk';
import { MessageAttachment } from 'discord.js';
import BetterClient from '../extensions/BetterClient';
import BetterGuild from '../extensions/BetterGuild';


export default class Logger {
    public client: BetterClient
   private errorHookID = process.env.ERRORHOOKID;
   private errorHookToken = process.env.ERRORHOOKTOKEN;
   private guildHookID = process.env.GUILDHOOKID;
   private guildHookToken = process.env.GUILDHOOKTOKEN;
    constructor(c: BetterClient) {
        this.client = c;
    }

    public async logError(error: any, folder: string) {
        if(typeof error == "object") error = JSON.stringify(error);
        this.logToConsole("ERROR", `${folder}\n\n${error}`);
        if(typeof error !== "string") return;
       if(this.errorHookID && this.errorHookToken) await (await this.client.fetchWebhook(this.errorHookID, this.errorHookToken))?.send({content: `new error in \`${folder}\``, files: [new MessageAttachment(Buffer.from(error), "error.txt")]})
    }

    public async logGuild(guild: BetterGuild, joined: boolean = true) {
        if(this.guildHookID && this.guildHookToken) await (await this.client.fetchWebhook(this.guildHookID, this.guildHookToken))?.send({embeds:[{
            title: `Guild ${joined === true ? "Joined": "Left"}`,
            color: joined ? "GREEN" : "RED",
            fields: [{
                name: "Guild Name",
                value: guild.name || "N/A",
                inline: true
            }, {
                name: "Guild Members",
                value: `${guild.memberCount || "N/A"}`,
                inline: true
            }, {
                name: "Total Guilds",
                value: this.client.guilds.cache.size.toString() || "N/A",
                inline: true
            }],
            footer: {
                text: "NFT Utils by @gegthedev"
            }
        }]})
    }
    private logToConsole(type: string, message: any) {
        console.log(`\n${chalk.red.bold(`===== ${type} =====`)}\n\n${message}\n\n${chalk.red.bold("=".repeat(12 + type.length))}\n`)
    }
}
