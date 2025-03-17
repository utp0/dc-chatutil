const { Client } = require("discord.js-selfbot-v13");
const { recordNew, updateGuilds } = require("./handleMessages.js");

/**
 * 
 * @param {Client} client 
 */
function doSetup(client) {
    client.on("ready", async () => {
        console.log(`Client is ready. Username: ${client.user.tag}`);
        console.log("Updating guilds...");
        await client.guilds.fetch();
        console.log("Updating all guilds data in database if needed...");
        updateGuilds(client.guilds.cache);
        console.log("Updated guilds.")
    });

    client.on("messageCreate", (message) => {
        recordNew(message);
    });
}

module.exports = {
    doSetup,
}
