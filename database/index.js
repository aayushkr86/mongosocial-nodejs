
var MongoClient = require("mongodb").MongoClient;
function getDb() {
    return MongoClient.connect('mongodb://mongosocialdbuser:mongosocialdbuserpwd&^%40@13.59.178.97:27017/mongosocial').then(function (db) {
        return db;
    })
}

module.exports = getDb();

