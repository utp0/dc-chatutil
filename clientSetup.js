const { Client } = require("discord.js-selfbot-v13");
const { recordNew, updateGuild, recordReaction, userSeen, updateChannel } = require("./handleMessages.js");
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
        updateChannel(message.channel, message.guild);
        userSeen(message.author, message.createdTimestamp);
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
    });

    client.on("messageReactionAdd", async (reaction, user, details) => {
        recordReaction(reaction, true, false);
        userSeen(user, Date.now());
        await reaction.message.fetch();
        recordNew(reaction.message);
        updateChannel(reaction.message.channel);
        updateGuild(reaction.message.guild);
    });

    client.on("messageReactionRemove", async (reaction, user, details) => {
        recordReaction(reaction, false, false);
        userSeen(user, Date.now());
        await reaction.message.fetch();
        recordNew(reaction.message);
        updateChannel(reaction.message.channel);
        updateGuild(reaction.message.guild);
    });
}

module.exports = {
    doSetup,
}
