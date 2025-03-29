// env
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: "./.env.private" });

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("Env var DISCORD_TOKEN not set.");
}

// setup
require("./RateLimiter.js").createQueue();
// Client
const client = require("./clientInstance.js").getClient();
const { doSetup } = require("./clientSetup.js");
doSetup(client);

// login
if (process.env["CONNECT_CLIENT"].trim() === "1") {
    client.login(process.env["DISCORD_TOKEN"].toString()).then((val) => {
        console.log("Login ok probably; ");  // TODO: don't probably
    }
    ).catch((reason) => {
        if (reason.code == "TokenInvalid") {
            console.error("\nLogin token invalid! (TokenInvalid error) exiting.")
        } else {
            console.error("Login ERROR, exiting...\n", reason);
        }
        process.emit("SIGINT");
    }
    );
}

let expressApp = undefined;

if (process.env["SERVE_WEB"] && process.env["SERVE_WEB"].trim() === "1") {
    const addr = process.env["WEB_IP"] || "127.0.0.1";
    const port = process.env["WEB_PORT"] || 8999;
    let appClass = require("./expressApp.js");
    expressApp = new appClass(addr, port);
    expressApp.startServer();
}
