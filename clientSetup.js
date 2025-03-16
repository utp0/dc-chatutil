/**
 * 
 * @param {Client} client 
 */
function doSetup(client) {
    client.on("ready", () => {
        console.log(`Client is ready. Username: ${client.user.tag}`)
    });

    client.on("messageCreate", (message) => {
        console.log("New message:\n", message);
    });
}

module.exports = {
    doSetup,
}
