const express = require('express');
const path = require('path');

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
