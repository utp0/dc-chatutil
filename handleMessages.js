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
db.exec(`PRAGMA encoding = 'UTF-8';`);
db.exec(`PRAGMA main.journal_mode = DELETE;`)

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
    attachments BLOB
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
            attachments
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
    }
    const attachmentsJson = JSON.stringify(message.attachments.map(a => a.url));
    try {
        let last = stmt.run(
            message.id,
            message.guildId,
            message.channelId,
            message.author.id,
            message.content,
            message.createdTimestamp,
            attachmentsJson
        );
        console.log(`messages\t${last.lastInsertRowid}`);
    } catch (error) {
        console.error(`Database error! Probably closed. (${error.code}, db status: ${db.open}`);
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
            "" + (author.avatar ?? "") ,
            "" + (author.banner ?? ""),
            "" + (author.bannerColor ?? ""),
            "" + (author.accentColor ?? ""),
            "" + (author.avatarDecorationData ?? ""),
            message.createdTimestamp
        );
    } catch (error) {
        
    }
}

module.exports = {
    recordNew,

}