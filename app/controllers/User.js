(function () {

    'use strict';

    var configApp = require('../../config/app')[process.env.NODE_ENV || 'development'];
    var getDbIns = require('../../database/index');
    var ObjectId = require('mongodb').ObjectID;
    var assert = require('assert');

    var dateService  = require('../services/DateService');
    var customError = require('../services/ErrorService');

    var jwt          = require('jsonwebtoken');
    var formidable   = require('formidable');
    var randomString = require('randomstring');
    var s3fs         = require('s3fs');
    var fs           = require('fs');
    var Jimp         = require('jimp');

    var AWS  = require('aws-sdk');

    AWS.config.update({
        accessKeyId: configApp.AWS_ACCESS_KEY_ID
      , secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY
      , region: 'us-east-2'
    });
    var s3       = new AWS.S3();
    var Promise  = require('bluebird');



    exports.registerUser        = registerUser;
    exports.loginUser           = loginUser;
    exports.uploadProfile       = uploadProfile;
    exports.userList            = userList;
    exports.userDetail          = userDetail;
    exports.changeUserStatus    = changeUserStatus; 
    exports.deleteObject        = deleteObject;
    exports.blockuser           = blockuser;
    exports.getblockeduserlist  = getblockeduserlist; 
    exports.unblockuser         = unblockuser;
    exports.editProfile         = editProfile;
    exports.followChannelOrUser      = followChannelOrUser;
    exports.updateNotificationStatus = updateNotificationStatus;
    exports.unFollowChannelOrUser    = unFollowChannelOrUser;  
    exports.getSubscriberList        = getSubscriberList;
    exports.getSubscribedList        = getSubscribedList;
    exports.getNotification          = getNotification;


    function getSubscriberList( req, res, next ){
      
            var followType      = req.body.followtype; // channel or user
            var userId          = req.user._id;
      
            getDbIns.then(function (db) {
      
                db.collection("followchanneluser").find({ userid: userId, followtype: followType, status: 'active' }).toArray(function(err, follows ) {
            
                    if (err) {
      
                      res.json({ "status":"0", "message": "Something went wrong" });
      
                    } else {
      
                      var response = [];
                      
                      if(follows.length){
                    
                         var count = 0;
                         follows.forEach(function(key, value){
                              //console.log(key.channeloruserid)
                          if( key.followtype == "channel" ){
      
                              db.collection("channels").find({_id: ObjectId(key.channeloruserid)}).toArray(function(err, channels) {
                                  
                                  response.push({
                                    "_id":key._id,
                                    "userid":key.userid,
                                    "followtype":key.followtype,
                                    "channeloruserid":key.channeloruserid,
                                    "status":key.status,
                                    "createdAt":key.createdAt,
                                    "channel":channels
                                  });
      
                                  count++;
      
                                  if( count == follows.length){
                                    res.json({"status":"1", "follows": response});
                                  }
                                 
                              });
      
                          }else if( key.followtype == "user" ){
      
                            db.collection("users").find({_id: ObjectId(key.channeloruserid)}).toArray(function(err, users) {
                                  
                                  response.push({
                                    "_id":key._id,
                                    "userid":key.userid,
                                    "followtype":key.followtype,
                                    "channeloruserid":key.channeloruserid,
                                    "status":key.status,
                                    "createdAt":key.createdAt,
                                    "user":users
                                  });
      
                                  count++;
      
                                  if( count == follows.length){
                                    res.json({"status":"1", "follows": response});
                                  }
                                 
                              });
      
                          }
      
                             
                          });
                          
                      }else{
                        res.json({"status":"1", "subscriber": follows});
                      }
      
                      
                    }         
                 });
      
      
              }); //db end
      
          }
      
      
          function getSubscribedList( req, res, next ){
      
               var followType      = req.body.followtype; // channel or user
               var userId          = req.user._id;
               var channeloruserid = req.body.channeloruserid;
       //console.log(userId)
            getDbIns.then(function (db) {
      
                db.collection("followchanneluser").find({ channeloruserid: channeloruserid, followtype: followType, status: 'active' }).toArray(function(err, follows ) {
                    //console.log(follows)
                    if (err) {
      
                      res.json({ "status":"0", "message": "Something went wrong" });
      
                    } else {
      
                      var response = [];
                      
                      if( follows.length ){
                         
                         var count = 0;
                         
                         follows.forEach(function(key, value){
                            //console.log(key.channeloruserid)
                          if( key.followtype == "channel" ){
      
                              db.collection("channels").find({_id: ObjectId(key.channeloruserid)}).toArray(function(err, channels) {
                                  //console.log(channels.length)
                                  response.push({
                                    "_id":key._id,
                                    "userid":key.userid,
                                    "followtype":key.followtype,
                                    "channeloruserid":key.channeloruserid,
                                    "status":key.status,
                                    "createdAt":key.createdAt,
                                    "channel":channels
                                  });
      
                                  count++;
      
                                  if( count == follows.length){
                                    res.json({"status":"1", "follows": response});
                                  }
                                 
                              });
      
                          }else if( key.followtype == "user" ){
                              //console.log(key.channeloruserid)
                            db.collection("users").find({_id: ObjectId(key.channeloruserid)}).toArray(function(err, users) {
                                  //console.log(users.length)
                                  response.push({
                                    "_id":key._id,
                                    "userid":key.userid,
                                    "followtype":key.followtype,
                                    "channeloruserid":key.channeloruserid,
                                    "status":key.status,
                                    "createdAt":key.createdAt,
                                    "user":users
                                  });
      
                                  count++;
      
                                  if( count == follows.length){
                                    res.json({"status":"1", "follows": response});
                                  }
                                 
                              });
      
                          }
      
                             
                          });
                          
                      }else{
                        res.json({"status":"1", "follows": follows});
                      }
      
                      
                    }         
                 });
      
      
              }); //db end
      
          }
      

          function getNotification( req, res, next ){
            
                  var userId = req.user._id;
            //console.log(userId)
                  getDbIns.then(function (db) {
            
                       db.collection("notification").find({userid: ObjectId(userId)}).toArray(function(err, user) {
                          if (err) {
                            res.json({ "status":"0", "message": "Something went wrong" });
                          } else {
            
                              res.json({"status":"1", "notification":user});
                            
                          }         
                       });
                        
                    }); //db end            
            
                }
 
                
          /*
            Update notification status
          */
      
          function updateNotificationStatus(req, res, next){
      
            var notificationId = req.body.notificationid;
            getDbIns.then(function (db) {
              //console.log(notificationId)
              db.collection("notification").findOneAndUpdate({'_id': ObjectId(notificationId)},
                    {$set:{"status" : 'read'}},
                    {projection: {returnOriginal: false}},
                    function(err, result) {
                      //console.log(result)
                      if( result.value != null ){
                        res.json({ "status":"1", "message": "Updated Successfully" });
                      }
                      else{
                        res.json({ "status":"1", "message": "Not found" });
                      }
                    }
                  
                  );
    
            });//db end
          }
      
      
         


          /*
            Function to follow channel or user
      
          */
      
          function followChannelOrUser( req, res, next ){
      
            var userId          = req.user._id;
            var followType      = req.body.followtype; // channel or user
      
            var channelOrUserId = req.body.channeloruserid;
            var createdAt       = new Date();
      
      
            getDbIns.then(function (db) {
      
              db.collection('followchanneluser').insertOne({
                  "userid"          : userId,
                  "followtype"      : followType,
                  "channeloruserid" : channelOrUserId,
                  "status"          : "active",
                  "createdAt"       : createdAt
               }, function(err, result) {
                    assert.equal( err, null );
                    db.collection('notification').insertOne({
                        "userid"          : userId,
                        "followtype"      : followType,
                        "channeloruserid" : channelOrUserId,
                        "status"          : "unread",
                        "action"          : "follow",
                        "createdAt"       : createdAt
                        
                     }, function(err, result) {
                          assert.equal( err, null );
                          res.json({ "status":"1", "message": "Followed Successfully" });
                    });
                    
              });
      
            });
      
          }
      
          /*
            Function to unfollow channel or user
          */
      
          function unFollowChannelOrUser( req, res, next ){
      
              var followid = req.body.followid;
      
              getDbIns.then(function (db) {
      
                //db.products.remove( { qty: { $gt: 20 } }, true );
                db.collection("followchanneluser").find({_id:ObjectId(followid)}).toArray(function ( err, notification ){
      
                  var userid          = notification[0].userid;
                  var followtype      = notification[0].followtype;
                  var channeloruserid = notification[0].channeloruserid;
                  var createdAt       = new Date();
      
                  db.collection('notification').insertOne({
                        "userid"          : userid,
                        "followtype"      : followtype,
                        "channeloruserid" : channeloruserid,
                        "status"          : "unread",
                        "action"          : "unfollow",
                        "createdAt"       : createdAt
                     }, function(err, result) {
      
                          assert.equal( err, null );
                          db.collection("followchanneluser").remove( { _id: ObjectId(followid) }, true );
                          res.json({ "status":"1", "message": "Unfollowed Successfully" });
      
                  });
      
                });
      
      
              }); 
              
      
          }
      
      



    function deleteObject( req, res, next ){

      var params = {
        Bucket: "mongosocial-uploads", 
        Delete: {
         Objects: [
            {
           Key: "profile-pics/xNNjrZCL4ie2vKX1tpWNzRV6Q5zE2l6dEGOIDyhbj8YJyrnGJEKgttH7PNTL6Z2g.jpg", 
           //VersionId: "2LWg7lQLnY41.maGB5Z6SWW.dcq0vx7b" 
          }
         ], 
         Quiet: false
        }
       };
       s3.deleteObjects(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred 
         else     console.log(data);           // successful response
       });
    }

    /*
      Function to register user
    */
    
    function registerUser( req, res, next ){

      var fullName   = req.body.fullName;
      var userName   = req.body.userName; 
      var email      = req.body.email;
      var dob        = req.body.dob;
      var currentAge = req.body.currentAge;
      var occupation = req.body.occupation;
      var city       = req.body.city;
      var state      = req.body.state;
      var touchid    = req.body.touchid;

     // console.log("Register"+req.body);

        getDbIns.then(function (db) {

          db.collection("users").find({userName:userName}).toArray(function (err,users){

            if( users.length > 0 ){

               res.json({ "status":"0", "message": "Username already exists" });

            }else{

                db.collection("users").find({email:email}).toArray(function (err,emails){

                    if( emails.length > 0 ){

                      res.json({ "status":"0", "message": "Email address already exists" });

                    }else{


                      db.collection("users").find({touchid:touchid}).toArray(function (err,touch){

                        if( touch.length > 0 ){
                            res.json({ "status":"0", "message": "Touch id already exist" });
                        }else{

                          var createdAt = new Date();

                          db.collection('users').insertOne({
                              
                              "fullName"      : fullName,
                              "userName"      : userName,
                              "email"         : email,
                              "dob"           : dob,
                              "currentAge"    : currentAge,
                              "occupation"    : occupation,
                              "city"          : city,
                              "state"         : state,
                              "touchid"       : touchid,
                              "profile_photo" : "",
                              "status"        : "active",
                              "createdAt"     : createdAt,
                              "updatedAt"     : createdAt,
                              "sessionID"     : "",
                              "tokenID"       : ""
                           }, function(err, result) {
                                assert.equal( err, null );
                                res.json({ "status":"1", "message": "You have registered successfully" });
                          });

                        }

                      }); //touch id  end

                      

                    }


                }); //email end


                }

            });//username end


         }); //db end

    }


    /*
      Function to login user
    */


    function loginUser( req, res, next ){

      var touchid    = req.body.touchid;
      var deviceToken = req.body.deviceToken;

        getDbIns.then(function (db) {

          db.collection("users").findOne({touchid:touchid}, { touchid: 1}, function (err,users){
             //console.log(users)
            if( users ){

              //var userdata = JSON.parse(users);

              var token = jwt.sign(users, configApp.API_TOKEN_SALT, {
                  expiresIn: 315360000 // expires in 10 years
              });

              db.collection("users").update({'touchid':touchid},
              {$set:{'status':"active","deviceToken":deviceToken}});

              res.json({token: token});

            }else{
              res.json({ "status":"0", "message": "Invalid touch id" });
            }


            });//username end


         }); //db end

    }

    function uploadProfile( req, res, next ){

      //console.log(configApp.AWS_ACCESS_KEY_ID);
      //console.log(configApp.AWS_SECRET_ACCESS_KEY);


        var form = new formidable.IncomingForm();
        var file = null; // the uploaded file
        var uniqueAvatarName = randomString.generate(64) + '.jpg';
        var avatar = null; // the new avatar
        var oldAvatar = null; // in case we need to delete an older version
        var s3fsImplimentation = new s3fs('mongosocial-uploads/profile-pics', {
            accessKeyId: configApp.AWS_ACCESS_KEY_ID,
            secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-2'
        });

        // start the promise string
        var promise = new Promise(function (resolve, reject) {

        form.parse(req, function (err, fields, files) { 
          
            if (err) {
                return reject('Unable to upload your profile');
            }

            // does the avatar file exist in the form?
            if (!files.avatar) {
                return reject('Please select an pic to upload');
            }

     // fieldss=fields;
      //console.log(fieldss);
            // set the file
            file = files.avatar;
            oldAvatar = fields.oldurl;
            
            return resolve();
        });

        }).then(function () {
            // this will create a new temp avatar that will be
            // the correct size and type in prep to upload to S3
            return new Promise(function (resolve, reject) {
                Jimp.read(file.path, function (err, newAvatar) {

                if (err) {
                    return reject(err);
                       }
                     newAvatar.write( file.path + '.jpg', function (err) {
                              if (err) {
                              return reject(err);
                     }
                    return resolve();
                          });
                });
    });

        }).then(function () {
            // this will upload the newAvatar
            // to S3 with a new name
      return new Promise(function (resolve, reject) {
            var stream = fs.createReadStream(file.path + '.jpg');

            s3fsImplimentation.writeFile(uniqueAvatarName, stream, {
                ACL: 'public-read'

            }).then(function (data) {

              console.log(oldAvatar);

              if( oldAvatar ){

                  var params = {
                  Bucket: "mongosocial-uploads", 
                  Delete: {
                   Objects: [
                      {
                     Key: "profile-pics/"+oldAvatar
                    }
                   ], 
                   Quiet: false
                  }
                 };
                 s3.deleteObjects(params, function(err, data) {
                   if (err)console.log(err, err.stack); // an error occurred
                   else  return resolve();          // successful response
                  });
              }else{
                  return resolve();
              }
              


                
  
            }).catch(function (err) {
                return reject(err);
            });
        });
      })
      .then(function () {

          getDbIns.then(function (db) {

            var updatedAt = new Date();

            db.collection("users").update({'_id':req.user._id},
            {$set:{'profile_photo':uniqueAvatarName,'updatedAt':updatedAt}});

            res.json({"success":"1", "profile_photo": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/profile-pics/"+uniqueAvatarName});


          }); //db end

      });

    }


    function userList( req, res, next ){

        getDbIns.then(function (db) {

           db.collection("users").find().toArray(function(err, users) {
              if (err) {
                res.json({ "status":"0", "message": "Something went wrong" });
              } else {
                res.json({ "status":"1", "users": users });
              }         
           });


         }); //db end

    }

    function userDetail( req, res, next ){
      var userId = req.user._id;
        getDbIns.then(function (db) {

          //console.log(userId);
          db.collection("users").findOne({_id:req.user._id}, function (err,users){
          //console.log(users)
            if( users ){
              //console.log(users._id);

              var response = [];
              
                         db.collection("friendslist").find({"Friendstatus" : true},{$or:[{userId:ObjectId(userId)},{friendId:ObjectId(userId)}]}).toArray(function(err,allfriends){
                          var totalfriends = allfriends.length;
                          
                          db.collection("followers").find({$and:[{userId:userId},{status:"following"}]}).toArray(function(err,followers){
                          var totalfollowers = followers.length;
                          response.push({
                                      "_id"           : users._id,
                                      "fullName"      : users.fullName,
                                      "userName"      : users.userName,
                                      "email"         : users.email,
                                      "dob"           : users.dob,
                                      "currentAge"    : users.currentAge,
                                      "occupation"    : users.occupation,
                                      "city"          : users.city,
                                      "state"         : users.state,
                                      "touchid"       : users.touchid,
                                      "profile_photo" : users.profile_photo,
                                      "status"        : users.status,
                                      "createdAt"     : users.createdAt,
                                      "updatedAt"     : users.createdAt,
                                      "sessionID"     : users.sessionID,
                                      "tokenID"       : users.tokenID,
                                      "expiredAT"     : users.expiredAT,
                                      "totalfriends"  : totalfriends,
                                      "totalfollowers": totalfollowers,
                                      });
                                                                        
                          res.json({ "status":"1", "user":response[0] });
                                    }) 
                        })
            }else{
              res.json({ "status":"0", "message": "No user found" });
            }


          });//username end

        }); //db end

    }
     /*
      Updadte user status
    */

    function changeUserStatus( req, res, next ){

      getDbIns.then(function (db) {
        var updatedAt = new Date();

        db.collection("users").update({'_id':req.user._id},
              {$set:{'status':"inactive",'updatedAt':updatedAt}});

        res.json({ "status":"1", "message": "Account Deactivated Successfully" });

      }); //db end

    }

    function editProfile( req, res, next ){
      
    var userId     = req.user._id;
    var fullName   = req.body.fullName;
    var userName   = req.body.userName; 
    var email      = req.body.email;
    var dob        = req.body.dob;
    var currentAge = req.body.currentAge;
    var occupation = req.body.occupation;
    var city       = req.body.city;
    var state      = req.body.state;
    //var touchid    = req.body.touchid;

          getDbIns.then(function (db) {
    
              var updatedAt = new Date();
    
              db.collection("users").update({'_id':req.user._id},
                {$set:{

                "fullName"      : fullName,
                "userName"      : userName,
                "email"         : email,
                "dob"           : dob,
                "currentAge"    : currentAge,
                "occupation"    : occupation,
                "city"          : city,
                "state"         : state,
                //"touchid"       : touchid,
                "status"        : "active",
                "updatedAt"     : updatedAt,
                //"sessionID"     : "",
                //"tokenID"       : "",
                //"expiredAT"     : ""
              }
            });
    
              res.json({ "status":"1", "message": "User Details Updated Successfully" });
    
           }); //db end   
        }

    function blockuser( req,res,next ){
      
          var userId        = req.user._id;  
          var blockuserId   = req.body.blockuserId;                             

          getDbIns.then(function (db) {  
              var createdAt = new Date();  
          
              db.collection('blockuser').insertOne({
                
                  "userId"       : userId,
                  "blockuserId"  : blockuserId,
                  "updatedAt"    : createdAt,
                  "blockedstatus": true                     
              },function(err, result) {
                  assert.equal( err, null );
                  res.json({ "status":"1", "message": "user blocked Successfully"});
              });
          
          }); //db end
  
      }

      function getblockeduserlist( req,res,next ){
        
        var userId = req.user._id;
    //console.log(userId)
            getDbIns.then(function (db) {   
                var createdAt = new Date();
    
                db.collection('blockuser').find({userId:ObjectId(userId)}).toArray(function(err,blocked){
                    if(err){
                          res.json({ "status":"0", "message": "Something went wrong" });
                        }
                       else{
                        res.json({"status":"1", "Blocked userlist":blocked});
                       }
        
            });
        
        });
     
        }


function unblockuser( req, res, next ){

var userId        =  req.user._id;
var blockuserId   =  req.body.blockuserId;

      getDbIns.then(function (db) {

          var updatedAt = new Date();

          db.collection("blockuser").update({userId:ObjectId(userId)},
            {$set:{
            'blockuserId'   : ObjectId(blockuserId),
            'blockedstatus' : false,
            'updatedAt'     : updatedAt
            
          }
        });

          res.json({ "status":"1", "message": "User unblocked Successfully" });

       }); //db end   
    }


})();