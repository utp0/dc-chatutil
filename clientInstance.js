const { Client, GatewayIntentBits } = require("discord.js-selfbot-v13")

class ClientInstance {
    static instance = undefined;
    #client = undefined;
    constructor() {
        if (!ClientInstance.instance) {
            this.#client = new Client(/*{
                intents: [
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildMessageReactions,
                    GatewayIntentBits.DirectMessages,
                ],
            }*/);
        } else {
            throw new Error("Client instance already exists (defined)!");
        }
    }
    /**
     * 
     * @returns {Client}
     */
    getClient() {
        return this.#client;
    }
}

const instance = new ClientInstance();
module.exports = {
    client: instance.getClient()
}
