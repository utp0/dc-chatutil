const sqlite3 = require("better-sqlite3");

/**
 * @type {sqlite3.Database}
 */
const db = require("./dbInstance.js").getDb();
const { client } = require("./clientInstance.js");
const { Guild, Message, Channel, ReactionManager, User } = require("discord.js-selfbot-v13");

// db setup
require("./dbSetup.js").setup(db);

/**
 * 
 * @param {Message} message entire message object
 */
async function recordNew(message) {
    let stmt;
    try {
        stmt = db.prepare(
            `INSERT OR IGNORE INTO messages (
            id,
            guild_id,
            channel_id,
            author_id,
            author_nick,
            content,
            timestamp,
            attachments,
            type,
            replied_to_id,
            mentions_everyone,
            mentions_users,
            mentions_roles,
            edit_time
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
        return;
    }

    let attachmentsJson = JSON.stringify(message.attachments.map(a => a.url));
    if (attachmentsJson.trim() === "[]") attachmentsJson = null;
    let mentionsUsers = JSON.stringify(message.mentions.users.map(a => a.id)).trim();
    if (mentionsUsers.length < 3) mentionsUsers = null;
    let mentionsRoles = JSON.stringify(message.mentions.roles.map(a => a.id)).trim();
    if (mentionsRoles.length < 3) mentionsRoles = null;

    let nick;
    if (message.member) {
        nick = message.member.displayName;
    } else if (message.author.globalName) {
        nick = message.author.globalName;
    } else {
        nick = message.author.tag;
    }

    let repliedToId = null;
    if (("" + message.type).toUpperCase().trim() === "REPLY") {
        let referenced = null;
        try {
            referenced = await message.fetchReference();
        } catch (error) {
            console.debug(`Failed to get referenced message of reply (${message.id})\n${error}\n== caught recordNew fetchReference`);
            referenced = null;
        }
        try {
            if (referenced && referenced.id) {
                repliedToId = referenced.id;
                // also send that off to be saved
                recordNew(referenced);
                try {
                    let refAuthor = await referenced.author.fetch();
                    userSeen(refAuthor, referenced.createdTimestamp);
                } catch (error) {
                    console.debug(`User not found by reference, not saving.\n${error}\n== caught recordNew userSeen`)
                }
            } else {
                console.debug(`Reply reference missing messageId, not saving it. (${message.id})`);
            }
        } catch (error) {
            console.error(`Failed to get referenced message (${message.id}):\n${error}\n== caught `);
        }
    }

    try {
        let last = stmt.run(
            message.id,
            message.guildId ?? 0,
            message.channelId ?? 0,
            message.author.id ?? 0,
            nick ?? "",
            message.content,
            message.createdTimestamp ?? 0,
            attachmentsJson ?? "",
            message.type ?? "",  // probably always has a value
            repliedToId ?? "",
            message.mentions.everyone ? 1 : 0,
            mentionsUsers ?? "",
            mentionsRoles ?? "",
            message.editedTimestamp ?? 0
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }
}

function userSeen(author, timestamp) {
    try {
        // Adding to the users table will be the least common here
        const stmt = db.prepare(
            `INSERT OR IGNORE INTO users (id, is_bot, is_system)
            VALUES(?, ?, ?);`
        );
        stmt.run(
            author.id,
            author.bot === true ? 1 : 0,
            author.system === true ? 1 : 0
        )
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }
    // Update user details if needed
    try {
        const stmt2 = db.prepare(
            `INSERT OR IGNORE INTO userdetails (
            id, name, create_time, avatar, banner, banner_color, accent_color, avatar_decoration_data, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
        );
        stmt2.run(
            author.id,
            String(author.username) ?? "",
            author.createdTimestamp ?? 0,
            (author.avatar === null || author.avatar === undefined) ? "" : String(author.avatar),
            (author.banner === null || author.banner === undefined) ? "" : String(author.banner),
            (author.bannerColor === null || author.bannerColor === undefined) ? "" : String(author.bannerColor),
            (author.accentColor === null || author.accentColor === undefined) ? "" : String(author.accentColor),
            (author.avatarDecorationData === null || author.avatarDecorationData === undefined) ? "" : JSON.stringify(author.avatarDecorationData),
            timestamp
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }
}

/**
 * 
 * @param {ReactionManager} reactionManager from a message
 * @param {boolean} boolAdded true if added, false if removed
 * @param {boolean} boolBackfill true if historical, false if event based
 */
function recordReaction(reactionManager, boolAdded, boolBackfill) {
    const stmt = db.prepare(
        `INSERT OR IGNORE INTO reactions (
        message_id, emoji_id, emoji_name, user_id, bool_added, bool_backfill, record_time)
        VALUES(?, ?, ?, ?, ?, ?, ?);
        `
    );
    const curUserIds = [];
    reactionManager.users.cache.forEach(async a => {
        curUserIds.push(a.id);
    });
    curUserIds.forEach(userId => {
        stmt.run(
            reactionManager.message.id,
            reactionManager.emoji.id ?? 0,
            reactionManager.emoji.name ?? "",
            userId,
            boolAdded === false ? 0 : 1,
            boolBackfill === true ? 1 : 0,
            Date.now()
        );
    });
}

function updateGuilds(guildcache) {
    guildcache.forEach(current => {
        updateGuild(current);
    });
}

/**
 * 
 * @param {Guild} guild 
 */
function updateGuild(guild) {
    try {
        if (!guild) return;  // not a guild
        const stmt = db.prepare(
            `INSERT OR IGNORE INTO guilds (
            id, name, icon, splash, banner, features, owner_id, created_timestamp, update_time)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`
        );

        stmt.run(
            guild.id,
            guild.name ?? "",
            guild.icon ?? "",
            guild.splash ?? "",
            guild.banner ?? "",
            JSON.stringify(guild.features) ?? "",
            guild.ownerId ?? 0,
            guild.createdTimestamp ?? 0,
            Date.now()
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }

}

/**
 * 
 * @param {Channel} channel 
 * @param {Guild} guild
 */
function updateChannel(channel) {
    const guild = channel.guild ?? null;
    try {
        const stmt = db.prepare(
            `INSERT OR IGNORE INTO channels (
            id, guild_id, name, position, created_timestamp, update_time)
            VALUES (?, ?, ?, ?, ?, ?);`
        );
        if (guild) {
            stmt.run(
                channel.id,
                guild.id,
                guild.channels.cache.get(channel.id).name ?? "",
                guild.channels.cache.get(channel.id).rawPosition ?? -1,
                guild.channels.cache.get(channel.id).createdTimestamp ?? 0,
                Date.now()
            );
        } else {
            stmt.run(
                channel.id,
                0,
                channel.name ?? "",
                channel.rawPosition ?? -1,
                channel.createdTimestamp ?? 0,
                Date.now()
            );
        }
    } catch (error) {
        console.error(error);
    }
}

function updateThread(thread) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO threads(
    id, name, created_timestamp, channel_id, owner_id, archived_timestamp, update_time)
    VALUES(?, ?, ?, ?, ?, ?, ?);`
    );
    stmt.run(
        thread.id,
        thread.name ?? "",
        thread.createdTimestamp ?? 0,
        thread.parentId ?? 0,
        thread.ownerId ?? 0,
        thread.archived ? thread.archivedTimestamp : 0,
        Date.now()
    );
}

function recordDeletion(id) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO deletions (
        id, timestamp)
        VALUES (?, ?);`
    );
    stmt.run(
        id,
        Date.now()
    );
}

module.exports = {
    recordNew,
    updateGuilds,
    updateGuild,
    recordReaction,
    userSeen,
    updateChannel,
    updateThread,
    recordDeletion,
    updateChannel,
    updateThread,
    recordDeletion,
}