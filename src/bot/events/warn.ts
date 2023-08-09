import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";


export default class Ready extends BaseEvent {
    
    constructor(client: BetterClient) {
        super(client, "warn")
    }

    override async execute(warning: any) {
        await this.client.logger.logError(warning, __filename)
    }
}