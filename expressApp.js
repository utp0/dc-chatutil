const express = require("express");
const path = require("path");
const sqlite3 = require("better-sqlite3");
const { getDb } = require("./dbInstance.js");
/**
 * @type {sqlite3.Database}
 */
const db = getDb();

/**
 * Express application wrapper for serving the web interface and API.
 */
class ExpressApp {
    /**
     * Creates an instance of ExpressApp.
     * @param {string} ipaddr The IP address to bind to.
     * @param {number} port The port to listen on.
     */
    constructor(ipaddr, port) {
        this.app = express();
        this.server = undefined;
        this.ipaddr = ipaddr;
        this.port = port;
        this.#setupApp();

        process.addListener("SIGINT", (event) => {
            this.stopServer();
        });
    }

    /**
     * Configures the Express application (views, static files, routes).
     */
    #setupApp() {
        this.app.set("view engine", "ejs");
        this.app.set("view options", {
            rmWhitespace: true,
            async: false,
        });
        this.app.set("views", path.join(__dirname, "views"));

        this.app.use(express.static(path.join(__dirname, "public")));

        this.app.get("/api/ping", (req, res) => {
            res.json({
                message: "pong!",
            });
        });

        this.app.get("/", (req, res) => {
            return res.redirect("/history");
            res.render("page", {
                page: "partial/index"
            });
        });

        this.app.get("/history", (req, res) => {
            res.render("page", {
                page: "partial/history"
            });
        });

        this.app.get("/api/messages/before", (req, res) => {
            this.getMessagesBefore(req, res);
        });

        this.app.get("/api/messages/after", (req, res) => {
            this.getMessagesAfter(req, res);
        });
    }

    /**
     * API endpoint handler to fetch messages before a specific timestamp.
     *
     * @param {express.Request} req The Express request object.
     * @param {express.Response} res The Express response object.
     */
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
                sql += " AND guild_id = ?";
                params.push(decodeURIComponent(guildId));
            }
            if (channelId) {
                sql += " AND channel_id = ?";
                params.push(decodeURIComponent(channelId));
            }
            if (memberId) {
                sql += " AND author_id = ?";
                params.push(decodeURIComponent(memberId));
            }

            sql += " ORDER BY timestamp DESC LIMIT ?";
            params.push(limit);

            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            res.json(rows);
        } catch (err) {
            console.error("Error fetching messages (before):", err);
            res.status(500).json({
                error: "An internal server error occurred while fetching messages.",
            });
        }
    }

    /**
     * API endpoint handler to fetch messages after a specific timestamp.
     *
     * @param {express.Request} req The Express request object.
     * @param {express.Response} res The Express response object.
     */
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
                sql += " AND guild_id = ?";
                params.push(guildId);
            }
            if (channelId) {
                sql += " AND channel_id = ?";
                params.push(channelId);
            }
            if (memberId) {
                sql += " AND author_id = ?";
                params.push(memberId);
            }

            sql += " ORDER BY timestamp ASC LIMIT ?";
            params.push(limit);

            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            res.json(rows);
        } catch (err) {
            console.error("Error fetching messages (after):", err);
            res.status(500).json({
                error: "An internal server error occurred while fetching messages.",
            });
        }
    }

    /**
     * Starts the HTTP server.
     */
    startServer() {
        this.server = this.app.listen(this.port, this.ipaddr, () => {
            console.log(
                `http://${this.ipaddr == "0.0.0.0" ? "127.0.0.1" : this.ipaddr}:${this.port
                }`
            );
        });
    }

    /**
     * Stops the HTTP server and closes connections.
     */
    stopServer() {
        if (!this.server) return;
        this.server.close();
        this.server.closeAllConnections();
    }
}

module.exports = ExpressApp;
