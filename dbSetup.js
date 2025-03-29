const { Database } = require("better-sqlite3");

class DbSetup {
    /**
     * setup the sqlite db; should be called every time the program starts
     * @param {Database} db 
     */
    static setup(db) {
        // TODO: all of this in an sql file
        try {
            db.exec(`PRAGMA encoding = 'UTF-8';`);
            db.exec(`PRAGMA journal_mode = WAL;`);
            db.exec(`PRAGMA synchronous = EXTRA;`);
            db.exec(`PRAGMA cache_size = -16384;`);
            db.exec(`PRAGMA journal_size_limit = 67108864;`);
            db.exec(`PRAGMA foreign_keys = ON;`);  // though unused right now, don't have it off
        } catch (error) {
            console.error(error);
            console.warn("Warning! Cannot set desired database pragmas, continuing without them.");
        }

        db.exec(`
        CREATE TABLE IF NOT EXISTS "sync_ranges" (
            "start_timestamp"	INTEGER NOT NULL,
            "end_timestamp"	INTEGER NOT NULL DEFAULT -1,
            "closed_safely"	INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY("start_timestamp")
        );
        `);
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
        ); `
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
        ); `
        );
        db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            is_bot INTEGER,
            is_system INTEGER
        );
        `);
        db.exec(`
        CREATE TABLE IF NOT EXISTS userdetails (
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
        db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER,
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
            edit_time INTEGER,
            UNIQUE(id, guild_id, channel_id, author_id, author_nick, content,
                timestamp, attachments, type, replied_to_id, mentions_everyone,
                mentions_users, mentions_roles, edit_time)
        );
        `);
        db.exec(`
        CREATE TABLE IF NOT EXISTS reactions (
            message_id INTEGER,
            emoji_id INTEGER,
            emoji_name TEXT,
            user_id INTEGER,
            bool_added INTEGER,
            bool_backfill INTEGER,
            record_time INTEGER
        );
        `);
        db.exec(`
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER,
            name TEXT,
            created_timestamp INTEGER,
            channel_id INTEGER,
            owner_id INTEGER,
            archived_timestamp INTEGER,
            update_time INTEGER,
            UNIQUE(id, name, channel_id, owner_id, archived_timestamp)
        );
        `);
        db.exec(`
        CREATE TABLE IF NOT EXISTS deletions (
            id INTEGER,
            timestamp INTEGER
        );
        `);
    }
}


module.exports = DbSetup;
