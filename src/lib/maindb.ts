
import * as config from "config";
let mongoose = require("mongoose");

global.Promise = require("q").Promise;
mongoose.Promise = global.Promise;


const db = mongoose.createConnection(String(config.get("mongodb")), {
    useNewUrlParser: true
});

db.on("error", console.error.bind(console, "connection to DB error: "));
db.once("open", function() {
    console.log("[Server]", "Connection with MongoDB installed");
});


export default db;
