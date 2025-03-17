const { Client, GatewayIntentBits } = require("discord.js-selfbot-v13")

class ClientInstance {
    static instance = undefined;
    constructor() {
        if (!ClientInstance.instance) {
            this.instance = new Client(/*{
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
        return this.instance;
    }
}

const instance = new ClientInstance();

process.addListener("SIGINT", () => {  // TODO: make this work
    console.log("destroying client...");
    instance.getClient().destroy();  // TODO: graceful disconnect?
    console.log("client destroyed.");
})

module.exports = {
    client: instance.getClient()
}
