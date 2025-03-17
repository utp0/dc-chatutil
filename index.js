// env
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: "./.env.private" });

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("Env var DISCORD_TOKEN not set.");
}

// Client
const { doSetup } = require("./clientSetup.js");
const { client } = require("./clientInstance.js");
// setup
doSetup(client);

// login

client.login(process.env["DISCORD_TOKEN"].toString()).then((val) => {
    console.log("Login ok probably; ");  // TODO: don't probably
}
).catch((reason) => {
    if (reason.code == "TokenInvalid") {
        console.log("\nLogin token invalid! (TokenInvalid error) exiting.")
        process.exit(1);
    } else {
        console.error("Login ERROR; ", reason);
    }
}
)
