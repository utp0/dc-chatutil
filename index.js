// env
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: "./.env.private" });

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("Env var DISCORD_TOKEN not set.");
}

// Client
const client = require("./clientInstance.js").getClient();
// setup
const limiter = require("./RateLimiter.js")();
const { doSetup } = require("./clientSetup.js");
doSetup(client);

// login

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

module.exports = {
    limiter,
}