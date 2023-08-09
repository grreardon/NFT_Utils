import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";


export default class Ready extends BaseEvent {
    
    constructor(client: BetterClient) {
        super(client, "error")
    }

    override async execute(error: any) {
        await this.client.logger.logError(error, __filename)
    }
}