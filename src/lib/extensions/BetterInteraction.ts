import { CommandInteraction } from "discord.js";
import BetterClient from "./BetterClient";
import BetterGuild from "./BetterGuild";


export default class BetterCommandInteraction extends CommandInteraction {
    declare public guild: BetterGuild | null;
    declare public client: BetterClient;

}