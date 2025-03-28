const sqlite3 = require("better-sqlite3");

class DatabaseInstance {
    /**
     * @type {sqlite3.Database}
     */
    static instance = undefined;

    static #closeDB() {
        console.log("closing db...");
        DatabaseInstance.instance.close();
        console.log("db closed.");
    }

    static openDB() {
        if (typeof (DatabaseInstance.instance) !== "undefined") {
            if (DatabaseInstance.instance && DatabaseInstance.instance.open) {
                console.warn("Warning: database already opened, doing nothing.");
                return;
            } else {
                console.error("Error: database is not open, but defined! Tying to open...");
            }
        }
        try {
            process.addListener("SIGINT", () => {
                console.log("Waiting to close db...")
                setTimeout(() => {
                    DatabaseInstance.#closeDB();
                }, 1000);
            });

            console.log("Connecting to database...");
            if (!process.env["DB_PATH"]) {
                throw new Error("DB_PATH env var is not set!");
            }
            DatabaseInstance.instance = new sqlite3(process.env["DB_PATH"], {
                fileMustExist: false,
                readonly: false
            });
            console.log("Connected to database.");
        } catch (error) {
            console.error("Failed setting up database connection!:\n")
            console.error(error);
            DatabaseInstance.instance.close();
            process.emit("SIGINT");  // TODO: move all exit code to custom event names
        }
    }

    /**
     * 
     * @returns {sqlite3.Database}
     */
    static getDB() {
        if (DatabaseInstance.instance === undefined) {
            DatabaseInstance.instance = null;
            DatabaseInstance.openDB();
        }
        return DatabaseInstance.instance;
    }
}


module.exports = {
    getDb: DatabaseInstance.getDB
};
