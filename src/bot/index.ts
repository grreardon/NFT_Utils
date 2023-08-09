import { load } from "dotenv-extended";
const environment = "prod"
load({
    //@ts-ignore
    path: environment === "dev" ? ".env.dev" : ".env.prod"
})
import BetterClient from "../lib/extensions/BetterClient";
import { Intents, Structures } from "discord.js";
import BetterGuild from "../lib/extensions/BetterGuild";
import BetterMember from "../lib/extensions/BetterMember";
import BetterMessage from "../lib/extensions/BetterMessage";


Structures.extend("Guild", () => BetterGuild);
Structures.extend("GuildMember", () => BetterMember);
//@ts-ignore
Structures.extend("Message", () => BetterMessage);

const client = new BetterClient({  allowedMentions: { parse: ["users"] }, intents: [Intents.FLAGS.GUILDS]})

client.login(process.env.TOKEN);
