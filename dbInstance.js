const sqlite3 = require("better-sqlite3");

class DatabaseInstance {
    /**
     * @type {sqlite3.Database}
     */
    static instance = undefined;

    DatabaseInstance() {
        
    }

    static openDB() {
        if(!DatabaseInstance.instance) {
            console.warn("Info: failed opening db: already opened")
        }
        try {
            process.addListener("SIGINT", () => {
                console.log("Waiting to close db...")
                setTimeout(() => {
                    console.log("closing db...");
                    DatabaseInstance.instance.close();
                    console.log("db closed.");
                }, 1000);
            });

            console.log("Connecting to database...");
            DatabaseInstance.instance = new sqlite3("db.db", {
                fileMustExist: false,
                readonly: false
            });
        } catch (error) {
            console.error("Failed setting up database connection! Full error:\n")
            console.error(error);
            DatabaseInstance.instance.close();
            process.emit("SIGINT");  // TODO: move all exit code to custom event names
        }
    }

    static getDB() {
        if(DatabaseInstance.instance === undefined) {
            DatabaseInstance.instance = null;
            DatabaseInstance.openDB();
        }
        return DatabaseInstance.instance;
    }
}


module.exports = {
    getDb: DatabaseInstance.getDB
};
