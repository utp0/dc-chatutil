const { Database } = require("better-sqlite3");

/**
 * setup the sqlite db
 * @param {Database} db 
 */
function setup(db) {
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
    db.exec(`
    CREATE TABLE IF NOT EXISTS channels (
        id INTEGER,
        guild_id INTEGER,
        name TEXT,
        position INTEGER,
        created_timestamp INTEGER,
        update_time INTEGER,
        UNIQUE(id, guild_id, name, position, created_timestamp)
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
    name TEXT,
    create_time INTEGER,
    avatar TEXT,
    banner TEXT,
    banner_color TEXT,
    accent_color TEXT,
    avatar_decoration_data TEXT,
    update_time INTEGER,
    UNIQUE(id, name, create_time, avatar, banner, banner_color, accent_color, avatar_decoration_data)
    );
    `);
    db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    guild_id INTEGER,
    channel_id INTEGER,
    author_id INTEGER,
    author_nick TEXT,
    content TEXT,
    timestamp INTEGER,
    attachments TEXT,
    type TEXT,
    replied_to_id INTEGER,
    mentions_everyone INTEGER,
    mentions_users TEXT,
    mentions_roles TEXT,
    UNIQUE(id, guild_id, channel_id, author_id, author_nick, content,
    timestamp, attachments, type, replied_to_id, mentions_everyone,
    mentions_users, mentions_roles)
    );
    `);
    db.exec(`CREATE TABLE IF NOT EXISTS reactions (
    message_id INTEGER,
    emoji_id INTEGER,
    emoji_name TEXT,
    user_id INTEGER,
    bool_added INTEGER,
    bool_backfill INTEGER,
    record_time INTEGER
    );
    `);
}

module.exports = {
    setup
}