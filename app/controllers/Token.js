(function () {

    'use strict';

    var configApp = require('../../config/app')[process.env.NODE_ENV || 'development'];
    var getDbIns = require('../../database/index');


    var OpenTok = require('opentok'),
    
    opentok     = new OpenTok( "46012102", "b68c9867b296df3b655c1abbd4d3c9ff4230a821" );

    var assert  = require('assert');

    exports.createToken  = createToken;
    exports.refreshToken = refreshToken; 
    
   function createToken( req, res, next ){

      var userId = req.user._id;
        
        // Create a session that will attempt to transmit streams directly between
        // clients. If clients cannot connect, the session uses the OpenTok TURN server:
        opentok.createSession(function(err, session) {

          if (err) return console.log(err);
         // res.json({"sessionID": session.sessionId });
         
         // Set some options in a Token
          var token = session.generateToken({
              role :                   'publisher',
              expireTime :             (new Date().getTime() / 1000)+(30 * 24 * 60 * 60), // in one week
              data :                   'name=Johnny',
              initialLayoutClassList : ['bestFit']
          });


          getDbIns.then(function (db) {

            var updatedAt = new Date();

             var nowPlus30Days = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
             
            db.collection("users").update({'_id':req.user._id},
              {$set:{ 'updatedAt':updatedAt, 'tokenID': token, 'sessionID': session.sessionId, 'expiredAT': nowPlus30Days}});

             res.json({"tokenID": token, "sessionID": session.sessionId });

          }); //db end

           
        });

    }


     function refreshToken( req, res, next ){

      var userId       = req.user._id;
      var sessionID    = req.body.sessionid;
      var token;
      var tokenOptions = {};

      tokenOptions.role = "publisher";
      tokenOptions.data = "name=Johnny";
      tokenOptions.initialLayoutClassList = ['bestFit'];
      tokenOptions.expireTime = (new Date().getTime() / 1000)+(30 * 24 * 60 * 60); // in one month

      token = opentok.generateToken(sessionID, tokenOptions);
      //console.log(token);
      getDbIns.then(function ( db ) {

          var updatedAt = new Date();

          var nowPlus30Days = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));

          db.collection("users").update({'_id':req.user._id},
            {$set:{ 'tokenID': token,'updatedAt':updatedAt, 'expiredAT': nowPlus30Days}});

          res.json({"tokenID": token, "sessionID": sessionID });

       });

    }



})();