const express = require('express');
const path = require('path');
const sqlite3 = require("better-sqlite3");
const { getDb } = require('./dbInstance.js');
/**
 * @type {sqlite3.Database}
 */
const db = getDb();

class ExpressApp {
    constructor(ipaddr, port) {
        this.app = express();
        this.server = undefined;
        this.ipaddr = ipaddr;
        this.port = port;
        this.#setupRoutes();

        process.addListener("SIGINT", (event) => {
            this.stopServer();
        });
    }

    #setupRoutes() {
        this.app.use(express.static(path.join(__dirname, 'public')));

        this.app.get("/api/ping", (req, res) => {
            res.json({
                message: "pong!"
            });
        });

        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        })

        this.app.get('/history', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'history.html'));
        });

        this.app.get('/api/messages/before', (req, res) => {
            this.getMessagesBefore(req, res);
        });

        this.app.get('/api/messages/after', (req, res) => {
            this.getMessagesAfter(req, res);
        });
    }

    getMessagesBefore(req, res) {
        const timestamp = req.query.timestamp;
        const limit = parseInt(req.query.limit) || 50;
        const guildId = req.query.guildId;
        const channelId = req.query.channelId;
        const memberId = req.query.memberId; // db author_id

        try {
            let sql = `SELECT
                CAST(id AS TEXT) AS id,
                CAST(guild_id AS TEXT) AS guild_id,
                CAST(channel_id AS TEXT) AS channel_id,
                CAST(author_id AS TEXT) AS author_id,
                author_nick,
                content,
                timestamp,
                attachments,
                type,
                CAST(replied_to_id AS TEXT) AS replied_to_id,
                mentions_everyone,
                mentions_users,
                mentions_roles,
                edit_time FROM messages WHERE timestamp < ?`;
            const params = [timestamp];

            if (guildId) {
                sql += ' AND guild_id = ?';
                params.push(decodeURIComponent(guildId));
            }
            if (channelId) {
                sql += ' AND channel_id = ?';
                params.push(decodeURIComponent(channelId));
            }
            if (memberId) {
                sql += ' AND author_id = ?';
                params.push(decodeURIComponent(memberId));
            }

            sql += ' ORDER BY timestamp DESC LIMIT ?';
            params.push(limit);

            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            res.json(rows);
        } catch (err) {
            console.error("Error fetching messages (before):", err);
            res.status(500).json({ error: "An internal server error occurred while fetching messages." });
        }
    }

    getMessagesAfter(req, res) {
        const timestamp = parseInt(req.query.timestamp);
        const limit = parseInt(req.query.limit) || 50;
        const guildId = req.query.guildId;
        const channelId = req.query.channelId;
        const memberId = req.query.memberId;

        try {
            let sql = `SELECT
                CAST(id AS TEXT) AS id,
                CAST(guild_id AS TEXT) AS guild_id,
                CAST(channel_id AS TEXT) AS channel_id,
                CAST(author_id AS TEXT) AS author_id,
                author_nick,
                content,
                timestamp,
                attachments,
                type,
                CAST(replied_to_id AS TEXT) AS replied_to_id,
                mentions_everyone,
                mentions_users,
                mentions_roles,
                edit_time FROM messages WHERE timestamp > ?`;
            const params = [timestamp];

            if (guildId) {
                sql += ' AND guild_id = ?';
                params.push(guildId);
            }
            if (channelId) {
                sql += ' AND channel_id = ?';
                params.push(channelId);
            }
            if (memberId) {
                sql += ' AND author_id = ?';
                params.push(memberId);
            }

            sql += ' ORDER BY timestamp ASC LIMIT ?';
            params.push(limit);

            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            res.json(rows);
        } catch (err) {
            console.error("Error fetching messages (after):", err);
            res.status(500).json({ error: "An internal server error occurred while fetching messages." });
        }
    }

    startServer() {
        this.server = this.app.listen(this.port, this.ipaddr, () => {
            console.log(`http://${this.ipaddr == "0.0.0.0" ? "127.0.0.1" : this.ipaddr}:${this.port}`);
        });
    }

    stopServer() {
        if (!this.server) return;
        this.server.close();
        this.server.closeAllConnections();
    }
}

module.exports = ExpressApp;
