import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";


export default class Ready extends BaseEvent {
    
    constructor(client: BetterClient) {
        super(client, "ready")
    }

    override async execute() {
        console.log(`Logged in as ${this.client?.user?.tag}`);
        await this.client.initSales();
        await this.client.loadJobs();
        setTimeout(() => {this.client.loadCommands()    }, 1000);
    }
}