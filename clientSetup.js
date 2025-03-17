const { Client } = require("discord.js-selfbot-v13");
const { recordNew } = require("./handleMessages.js");

/**
 * 
 * @param {Client} client 
 */
function doSetup(client) {
    client.on("ready", () => {
        console.log(`Client is ready. Username: ${client.user.tag}`)
    });

    client.on("messageCreate", (message) => {
        recordNew(message);
    });
}

module.exports = {
    doSetup,
}
