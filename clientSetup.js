const { Client, Guild } = require("discord.js-selfbot-v13");
const { recordNew, updateGuild, recordReaction, userSeen, updateChannel, updateThread, recordDeletion } = require("./handleMessages.js");
const { default: PQueue } = require("p-queue");

/**
 * 
 * @param {Client} client 
 */
function doSetup(client) {
    const limiter = require("./RateLimiter.js").getQueue();

    client.on("ready", () => {
        console.log(`Client is ready. Username: ${client.user.tag}`);
    });

    client.on("messageCreate", (message) => {
        recordNew(message);
        updateChannel(message.channel, message.guild);
        userSeen(message.author, message.createdTimestamp);
    });

    client.on("messageUpdate", (mOld, mNew) => {
        recordNew(mNew);
        updateChannel(mNew.channel, mNew.guild);
        userSeen(
            mNew.author,
            mNew.editedTimestamp ?? mNew.createdTimestamp
        );
    })

    client.on("messageDelete", msg => {
        recordDeletion(msg.id);
    })

    client.on("guildCreate", async guild => {

        try {
            /**
             * @type {Guild}
             */
            const fetchedGuild = await limiter.add(guild.fetch());
            updateGuild(fetchedGuild);
        } catch (error) {
            console.error(`Failed fetching guild! == client.on guildCreate\n`, error);
        }
    });

    client.on("guildUpdate", (gOld, gNew) => {
        updateGuild(gNew);
    });

    client.on("guildAvailable", async guild => {
        await guild.fetch();
        updateGuild(guild);
    });

    client.on("guildDelete", guild => {
        recordDeletion(guild.id);
    });

    client.on("channelCreate", channel => {
        updateChannel(channel);
    });

    client.on("channelUpdate", (cOld, cNew) => {
        updateChannel(cNew);
    });

    client.on("channelDelete", channel => {
        recordDeletion(channel.id);
    });

    client.on("messageReactionAdd", async (reaction, user, details) => {
        recordReaction(reaction, true, false);
        userSeen(user, Date.now());
        await limiter.add(() => reaction.message.fetch());
        recordNew(reaction.message);
        updateChannel(reaction.message.channel);
        updateGuild(reaction.message.guild);
    });

    // TODO: need more robost logic. removed users are not in event
    /*client.on("messageReactionRemove", async (reaction, user, details) => {
        
        recordReaction(reaction, false, false);
        userSeen(user, Date.now());
        await reaction.message.fetch();
        recordNew(reaction.message);
        updateChannel(reaction.message.channel);
        updateGuild(reaction.message.guild);
    });*/

    client.on("threadCreate", (thread, _) => {
        updateThread(thread);
    });

    client.on("threadUpdate", (tOld, tNew) => {
        updateThread(tNew);
    });

    client.on("threadDelete", thread => {
        recordDeletion(thread.id);
    });

    client.on("threadListSync", threads => {
        for (const thread of threads.values()) {
            updateThread(thread);
        }
    });
}

module.exports = {
    doSetup,
}
