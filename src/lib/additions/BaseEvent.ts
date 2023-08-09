import BetterClient from "../extensions/BetterClient";


export default class BaseEvent {

    public client: BetterClient
    public name: string
    constructor(client: BetterClient, name: string) {
        this.client = client;
        this.name = name;
    }

    //@ts-expect-error 
    public async execute(...args: any): Promise<any> {}
}