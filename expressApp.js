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
        const timestamp = parseInt(req.query.timestamp);
        const limit = parseInt(req.query.limit) || 50;

        try {
            const stmt = db.prepare('SELECT * FROM messages WHERE timestamp < ? ORDER BY timestamp DESC LIMIT ?');
            const rows = stmt.all(timestamp, limit);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    getMessagesAfter(req, res) {
        const timestamp = parseInt(req.query.timestamp);
        const limit = parseInt(req.query.limit) || 50;

        try {
            const stmt = db.prepare('SELECT * FROM messages WHERE timestamp > ? ORDER BY timestamp ASC LIMIT ?');
            const rows = stmt.all(timestamp, limit);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    startServer() {
        this.server = this.app.listen(this.port, this.ipaddr, () => {
            console.log(`http://${this.ipaddr == "0.0.0.0" ? "127.0.0.1" : this.ipaddr}:${this.port}`);
        });
    }

    stopServer() {
        this.server.close();
        this.server.closeAllConnections();
    }
}

module.exports = ExpressApp;
