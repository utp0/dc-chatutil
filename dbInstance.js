const sqlite3 = require("better-sqlite3");

/**
 * Singleton class to manage the SQLite database connection.
 */
class DatabaseInstance {
    /**
     * @type {sqlite3.Database}
     */
    static instance = undefined;
    static #startTimestamp = Date.now();
    static #sessionRowId = undefined;

    /**
     * Closes the database connection.
     */
    static #closeDB() {
        console.log("closing db...");
        DatabaseInstance.instance.close();
        console.log("db closed.");
    }

    /**
     * Gets the timestamp when the database module was initialized.
     * @returns {number} The start timestamp.
     */
    static #getStartTimestamp() {
        return DatabaseInstance.#startTimestamp;
    }

    /**
     * Gets the row ID of the current session in the sync_ranges table.
     * @returns {number|undefined} The session row ID.
     */
    static #getSessionRowId() {
        return DatabaseInstance.#sessionRowId;
    }

    /**
     * Records the session start or end time in the database.
     *
     * @param {boolean} [close=false] Whether this is recording the session close (true) or start (false).
     */
    static #recordSessionTime(close = false) {
        const startTime = DatabaseInstance.#getStartTimestamp();
        const endTime = Date.now();
        try {
            /**
             * @type {sqlite3.Statement}
             */
            const stmt = DatabaseInstance.getDB().prepare(`
                INSERT INTO sync_ranges (start_timestamp, end_timestamp, closed_safely)
                    VALUES (?, ?, ?)
                    ON CONFLICT (start_timestamp)
                    DO UPDATE SET
                        start_timestamp = excluded.start_timestamp,
                        end_timestamp = excluded.end_timestamp,
                        closed_safely = excluded.closed_safely;
            `);
            DatabaseInstance.#sessionRowId = stmt.run(
                startTime ?? null,  // making sure there's an error if
                close ? endTime : -1,
                close ? 1 : 0
            ).lastInsertRowid;
        } catch (error) {
            console.error(`Failed writing session start time! It is recommended to stop the program.\n`, error);
        }
    }

    /**
     * Opens the SQLite database connection.
     * Sets up SIGINT listeners to close the database gracefully.
     */
    static openDB() {
        if (typeof (DatabaseInstance.instance) !== "undefined") {
            if (DatabaseInstance.instance && DatabaseInstance.instance.open || DatabaseInstance.#sessionRowId !== undefined) {
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
                    // record session end time to db
                    DatabaseInstance.#recordSessionTime(true);
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

            // record session start time to db
            DatabaseInstance.#recordSessionTime(false);


        } catch (error) {
            console.error("Failed setting up database connection!:\n")
            console.error(error);
            DatabaseInstance.instance.close();
            process.emit("SIGINT");  // TODO: move all exit code to custom event names
        }
    }

    /**
     * Retrieves the singleton SQLite database instance.
     * If the instance is undefined, it opens a new connection.
     *
     * @returns {sqlite3.Database} The SQLite database instance.
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
