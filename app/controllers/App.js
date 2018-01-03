(function () {

    'use strict';

    var configApp = require('../../config/app')[process.env.NODE_ENV || 'development'];
    var getDbIns  = require('../../database/index');

    //console.log(db);

    var assert = require('assert');

    exports.getIndex  = getIndex;
    exports.getHealth = getHealth;
    exports.saveData  = saveData;

    /**
     * API welcome response
     */
    function getIndex(req, res, next) {
        return res.json({
            message: 'MONGO SOCIAL API V:' + configApp.VERSION
        });
    }

    /**
     * Is the API up and running
     */
    function getHealth(req, res, next) {
        return res.json({
            message: 'ONLINE'
        });
    }

    function saveData(){

        getDbIns.then(function (db) {

            db.collection('restaurants').insertOne( {
              "address" : {
                 "street" : "2 Avenue",
                 "zipcode" : "10075",
                 "building" : "1480",
                 "coord" : [ -73.9557413, 40.7720266 ]
              },
              "borough" : "Manhattan",
              "cuisine" : "Italian",
              "grades" : [
                 {
                    "date" : new Date("2014-10-01T00:00:00Z"),
                    "grade" : "A",
                    "score" : 11
                 },
                 {
                    "date" : new Date("2014-01-16T00:00:00Z"),
                    "grade" : "B",
                    "score" : 17
                 }
              ],
              "name" : "Vella",
              "restaurant_id" : "41704620"
           }, function(err, result) {
                assert.equal(err, null);
                console.log("Inserted a document into the restaurants collection.");
               // callback();
              });


         });
    }



})();