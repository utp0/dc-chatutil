const { Client } = require("discord.js-selfbot-v13");
const { recordNew, updateGuild } = require("./handleMessages.js");
const fs = require("fs");

/**
 * 
 * @param {Client} client 
 */
function doSetup(client) {
    client.on("ready", () => {
        console.log(`Client is ready. Username: ${client.user.tag}`);
    });

    client.on("messageCreate", (message) => {
        recordNew(message);
    });

    client.on("guildUpdate", (gOld, gNew) => {
        updateGuild(gNew);
    });

    client.on("guildAvailable", async guild => {
        await guild.fetch();
        updateGuild(guild);
    });

    client.on("guildCreate", async guild => {
        await guild.fetch();
        updateGuild(guild);
    })
}

module.exports = {
    doSetup,
}
