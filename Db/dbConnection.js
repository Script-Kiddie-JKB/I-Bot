require("dotenv").config({ path: "./Keys.env" });

const { MongoClient, ServerApiVersion } = require("mongodb");

const mdbUsername = process.env.MDB_USERNAME;
const mdbPassword = process.env.MDB_PASSWORD;
const uri = `mongodb+srv://newsassybot:xxjaikishanxx@newbot.ytcw5xm.mongodb.net/?retryWrites=true&w=majority&appName=NewBot`;
console.log(uri);

const mdClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
mdClient.connect();
module.exports = mdClient;
