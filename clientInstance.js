const { Client } = require("discord.js-selfbot-v13")

class ClientInstance {
    /**
     * @type {Client}
     */
    static instance = undefined;

    static #destroyClient() {
        console.log("destroying client...");
        ClientInstance.getClient().destroy();  // TODO: graceful disconnect?
        console.log("client destroyed.");
    }

    static openClient() {
        if (!ClientInstance.instance) {
            ClientInstance.instance = new Client();
            process.addListener("SIGINT", () => {
                ClientInstance.#destroyClient();
            });
        } else {
            console.error("Client instance already exists (defined), doing nothing.");
        }
    }

    /**
     * 
     * @returns {Client}
     */
    static getClient() {
        if (ClientInstance.instance === undefined) {
            ClientInstance.instance = null;
            ClientInstance.openClient();
        }
        return ClientInstance.instance;
    }
}

module.exports = {
    getClient: ClientInstance.getClient
}
