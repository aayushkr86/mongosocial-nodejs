(function () {

    'use strict';

    var configApp = require('../../config/app')[process.env.NODE_ENV || 'development'];
    var getDbIns = require('../../database/index');

    var assert = require('assert');
    var apn = require("apn");

    var path = require('path');

    exports.sendPushNotification = sendPushNotification;
    
    function sendPushNotification( req, res, next ){
        
       var userId      = req.user._id;

       var deviceToken1 = req.body.deviceToken1;
       var deviceToken2 = req.body.deviceToken2;
       var deviceToken3 = req.body.deviceToken3;
       var deviceToken4 = req.body.deviceToken4;

       var type 	   = req.body.type;

       getDbIns.then(function (db) {

	       db.collection("users").find({_id:userId}).toArray(function (err,users){

	       		var sessionID = users[0].sessionID;
	       		var tokenID   = users[0].tokenID;
	       		var userName  = users[0].userName;

	       		//sessionID = "1_MX40NjAxMjEwMn5-MTUxMjEzMTQyMjI4MH5EVU44KzZ0OHJFR1VJNEhRWjVoS2ZTVnd-UH4";
	       		//tokenID   = "T1==cGFydG5lcl9pZD00NjAxMjEwMiZzaWc9MTY1MzE3MjlmZjUxMmVjNzg2MjFiNjBmNGQwZWU4YTYzMGQ1NDkyNzpzZXNzaW9uX2lkPTFfTVg0ME5qQXhNakV3TW41LU1UVXhNakV6TVRReU1qSTRNSDVFVlU0NEt6WjBPSEpGUjFWSk5FaFJXalZvUzJaVFZuZC1VSDQmY3JlYXRlX3RpbWU9MTUxMjEzMTQyMiZub25jZT0wLjg3MzU1Nzk1OTQ1MjYzMSZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTE0NzIzNDIyJmNvbm5lY3Rpb25fZGF0YT1uYW1lJTNESm9obm55JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9Zm9jdXM=";



	   //     		var options = { 
				//     "cert": path.resolve(__dirname + "/pem/pushcert_prod.pem"),
				//     "key": path.resolve(__dirname + "/pem/pushcert_prod.pem"),
				//     "gateway": "gateway.push.apple.com",
				//     "passphrase": "mongo@123",  
				//     "enhanced": true,
				//     "cacheLength": 5,
				// };

				var options = { 
				    "cert": path.resolve(__dirname + "/pem/pushcert_dev.pem"),
				    "key": path.resolve(__dirname + "/pem/pushcert_dev.pem"),
				    "gateway": "gateway.sandbox.push.apple.com",
				    "passphrase": "mongo@123",  
				    "enhanced": true,
				    "cacheLength": 5,
				};
	
				var message = {"sessionID": sessionID, "tokenID": tokenID, "type": type, "userName": userName};

				var apnConnection = new apn.Provider(options);
			  	var notify = new apn.Notification();
				notify.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
				// notify.badge = 1;
				notify.sound = "ping.aiff";
				notify.alert = "Calling you";
				notify._key=userId;
				notify.payload = {"message": message, "key": userId};
				notify.device="iOS";
				notify.contentAvailable = true;
				notify.topic = "com.MongoSocial";

			    //var deviceToken = "B33E82872D2A11056FFAA5A2CA2EC3F4E5FC70A45C4B9060F1B1232423093381";

				try {

					//myDevice = new apn.Device(keys.deviceToke);
					if (apnConnection) {
						if(deviceToken1){
							apnConnection.send(notify, deviceToken1).then( (result) => {
							//console.log(JSON.parse(JSON.stringify(result)));

							//var gotres=JSON.parse(JSON.stringify(result));

							//var gotres=JSON.parse(JSON.stringify(result));
							//console.log(gotres.failed);  
							

							if(deviceToken2){
								apnConnection.send(notify, deviceToken2).then( (result) => {

									if(deviceToken3){
										apnConnection.send(notify, deviceToken3).then( (result) => {

											if( deviceToken4 ){
												apnConnection.send(notify, deviceToken4).then( (result) => {

													res.json({"status":"1", "message":"Successfully"});
												});	
											}
											
										});
									}

								});
							}

						    });
						}
					    

					   // apnConnection.send(notify, deviceToken).then( (result) => {
					   // });

					}

			    } catch (e) {
					res.json({"status":"0", "message":"Error in iPhone"});
			    }


	       });

	    }); //db end

    }



})();