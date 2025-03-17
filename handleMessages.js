const sqlite3 = require("better-sqlite3");
const db = new sqlite3("db.db",
    {
        fileMustExist: false,
        readonly: false,
    }
);
const { client } = require("./clientInstance.js");

process.addListener("SIGINT", () => {
    console.log("Waiting to close db...")
    setTimeout(() => {
        console.log("closing db...");
        db.close();
        console.log("db closed.");
    }, 1000);
})

// init database
try {
    db.exec(`PRAGMA encoding = 'UTF-8';`);
    db.exec(`PRAGMA main.journal_mode = DELETE;`);
} catch (error) {
    console.error(error);
    console.warn("Warning! Cannot set desired database pragmas, continuing without them.");
}

db.exec(`
    CREATE TABLE IF NOT EXISTS guilds (
        id INTEGER,
        name TEXT,
        icon TEXT,
        splash TEXT,
        banner TEXT,
        features TEXT,
        owner_id INTEGER,
        created_timestamp INTEGER,
        update_time INTEGER,
        UNIQUE(id, name, icon, splash, banner, features, owner_id, created_timestamp)
    );`
);

db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    is_bot INTEGER,
    is_system INTEGER
);
`);
db.exec(`CREATE TABLE IF NOT EXISTS userdetails (
    id INTEGER,
    avatar TEXT,
    banner TEXT,
    banner_color TEXT,
    accent_color TEXT,
    avatar_decoration_data TEXT,
    update_time INTEGER,
    UNIQUE(id, avatar, banner, banner_color, accent_color, avatar_decoration_data)
);
`);
db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    guild_id INTEGER,
    channel_id INTEGER,
    author_id INTEGER,
    content TEXT,
    timestamp INTEGER,
    attachments TEXT,
    type TEXT,
    replied_to_id INTEGER,
    mentions_everyone INTEGER,
    mentions_users TEXT,
    mentions_roles TEXT
);
`);


/**
 * 
 * @param {*} message The entire message object from the event.
 */
function recordNew(message) {
    let stmt;
    try {
        stmt = db.prepare(
            `INSERT OR IGNORE INTO messages (
            id,
            guild_id,
            channel_id,
            author_id,
            content,
            timestamp,
            attachments,
            type,
            replied_to_id,
            mentions_everyone,
            mentions_users,
            mentions_roles
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }

    let attachmentsJson = JSON.stringify(message.attachments.map(a => a.url));
    if (attachmentsJson.trim() === "[]") attachmentsJson = null;
    let mentionsUsers = JSON.stringify(message.mentions.users.map(a => a.id)).trim();
    if (mentionsUsers.length < 3) mentionsUsers = null;
    let mentionsRoles = JSON.stringify(message.mentions.roles.map(a => a.id)).trim();
    if (mentionsRoles.length < 3) mentionsRoles = null;

    try {
        let last = stmt.run(
            message.id,
            message.guildId,
            message.channelId,
            message.author.id,
            message.content,
            message.createdTimestamp,
            attachmentsJson,
            message.type ?? "",  // probably always has a value
            ("" + message.type).toUpperCase().trim() === "REPLY" ? message.reference.messageId : "",
            message.mentions.everyone ? 1 : 0,
            mentionsUsers,
            mentionsRoles
        );
        //console.log(`messages\t${last.lastInsertRowid}`);
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }
    userSeen(message);
}

function userSeen(message) {
    const author = message.author;
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
        // Update user details if needed
        const stmt2 = db.prepare(
            `INSERT OR IGNORE INTO userdetails (
            id, avatar, banner, banner_color, accent_color, avatar_decoration_data, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?);`
        );
        stmt2.run(
            author.id,
            (author.avatar === null || author.avatar === undefined) ? "" : String(author.avatar),
            (author.banner === null || author.banner === undefined) ? "" : String(author.banner),
            (author.bannerColor === null || author.bannerColor === undefined) ? "" : String(author.bannerColor),
            (author.accentColor === null || author.accentColor === undefined) ? "" : String(author.accentColor),
            (author.avatarDecorationData === null || author.avatarDecorationData === undefined) ? "" : String(author.avatarDecorationData),
            message.createdTimestamp
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }
}

function updateGuilds(guildcache) {
    guildcache.forEach(current => {
        updateGuild(current);
    });
}

function updateGuild(guild) {
    try {
        const stmt = db.prepare(
            `INSERT OR IGNORE INTO guilds (
            id, name, icon, splash, banner, features, owner_id, created_timestamp, update_time)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`
        );

        stmt.run(
            guild.id, guild.name ?? "", guild.icon ?? "", guild.splash ?? "", guild.banner ?? "",
            JSON.stringify(guild.features), guild.ownerId ?? "", guild.createdTimestamp,
            Date.now()
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
        console.error(error);
    }

}

module.exports = {
    recordNew,
    updateGuilds
}