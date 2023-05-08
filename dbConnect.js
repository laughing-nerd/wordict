require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const mongoclient = new MongoClient(process.env.DB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const connection = async () =>{
await mongoclient.connect();
}

connection();

module.exports = mongoclient;


