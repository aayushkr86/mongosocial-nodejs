(function() {

    'use strict';

    var configApp = require('../../config/app')[process.env.NODE_ENV || 'development'];

    
    var customError = require('../services/ErrorService');
    var getDbIns = require('../../database/index');
    var ejs = require('ejs');
    var fs = require('fs');
    var fs = require('utils');
    var jwt = require('jsonwebtoken');
   // var dateService = require('../services/DateService');
   // var emailService = require('../services/EmailService');
   // var numeral = require('numeral');
    var Promise = require('bluebird');
    //var randomString = require('randomstring');
    
   

    //exports.getUser = getUser;
    
    exports.isAuthenticated = isAuthenticated;
    
    /**
     * Authentication middle-ware that will verify that
     * a request is being passed an active token
     * @param {string} token the jsonwebtoken
     */
     
    function isAuthenticated(req, res, next) {
		
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        var decodedToken = {};

        if (!token) {
            throw new customError('No token provided.', 403);
            //res.json({"message":"No token provided"});
        }

        return new Promise(function(resolve, reject) {
            jwt.verify(token, configApp.API_TOKEN_SALT, function(err, decoded) {
                if (err) {
                    return reject(new customError('Failed to authenticate token.', 403));
                    //res.json({"message":"Failed to authenticate token."});
                }

                return resolve(decoded);
            });

        }).then(function(decoded) {

            decodedToken = decoded;

            /**
             * Pull the user's details
             */
             return getDbIns.then(function (db) {

                 db.collection("users").findOne({touchid:decodedToken.touchid}, { touchid: 1}, function (err,users){
                     //console.log("Users "+users);

                    if (!users) {
                        throw new customError('No user found.', 403);
                        //res.json({"message":"No user found."});
                    }

                    users.iat = decodedToken.iat;
                    users.exp = decodedToken.exp;

                    if (JSON.stringify(users) != JSON.stringify(decodedToken) ) {
                        throw new customError('Token expired. Please log back in.', 403);
                         //res.json({"message":"Token expired. Please log back in."});
                    }
                    req.user = users;
                    return next(); 
                }); //touchid end


            }); //db end

        }).catch(function(err) {
            console.log('err', err);

            return next(err);
        });
    }

    
	
})();
