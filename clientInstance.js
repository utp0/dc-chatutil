const { Client } = require("discord.js-selfbot-v13")

/**
 * Singleton class to manage the Discord Client instance.
 */
class ClientInstance {
    /**
     * The singleton instance of the Client.
     * @type {Client}
     */
    static instance = undefined;

    /**
     * Destroys the current client instance.
     * Intended to be called on process exit.
     */
    static #destroyClient() {
        console.log("destroying client...");
        ClientInstance.getClient().destroy();  // TODO: graceful disconnect?
        console.log("client destroyed.");
    }

    /**
     * Initializes the Discord Client if it doesn't exist.
     * Sets up a SIGINT listener to destroy the client on exit.
     */
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
     * Retrieves the singleton Discord Client instance.
     * If the instance is undefined, it initializes a new one.
     *
     * @returns {Client} The Discord Client instance.
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
