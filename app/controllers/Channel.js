(function () {

    'use strict';

    var configApp = require('../../config/app')[process.env.NODE_ENV || 'development'];
    var getDbIns = require('../../database/index');
    var ObjectId = require('mongodb').ObjectID;

    var assert = require('assert');

    var dateService  = require('../services/DateService');
    var customError  = require('../services/ErrorService');

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

    
    

    exports.createChannel                   = createChannel;
    exports.editChannel                     = editChannel;  
    exports.uploadChannelProfileBannerImage = uploadChannelProfileBannerImage; 
    exports.getChannelList                  = getChannelList;
    exports.getChannelDetail                = getChannelDetail;
    exports.uploadChannelVideos             = uploadChannelVideos; 
    exports.uploadChannelImage              = uploadChannelImage;
    exports.addCommenttoVideoImageChannel   = addCommenttoVideoImageChannel;
    exports.getVideoList                    = getVideoList;
    exports.getImageList                    = getImageList;  

    
    exports.uploadVideostatus               = uploadVideostatus;
    exports.getVideoStatus                  = getVideoStatus;
    exports.getAllVideoStatus               = getAllVideoStatus;
    exports.addCommenttoVideostatus         = addCommenttoVideostatus;
    exports.addTextCommenttoVideostatus     = addTextCommenttoVideostatus;
    exports.getcommentOnVideoStatus         = getcommentOnVideoStatus;
    
    exports.getChannelsVideoImageComments   = getChannelsVideoImageComments;
    exports.getChannelsVideosComments       = getChannelsVideosComments;  
    exports.getChannelsImagesComments       = getChannelsImagesComments; 
    
    /*
      Function to create channel
    */

    function createChannel( req, res, next ){

        var profilePic  = req.body.profile_pic;
        var bannerPic   = req.body.banner_pic; 
        var channelName = req.body.channel_name;
        var website     = req.body.website;
        var email       = req.body.email;
        var description = req.body.description;


        getDbIns.then(function (db) {

          var createdAt = new Date();

          db.collection('channels').insertOne({
              "userid"       : req.user._id,
              "profilePic"   : profilePic,
              "bannerPic"    : bannerPic,
              "channelName"  : channelName,
              "website"      : website,
              "email"        : email,
              "description"  : description,
              "createdAt"    : createdAt,
              "updatedAt"    : createdAt
           }, function(err, result) {
                assert.equal( err, null );
                res.json({ "status":"1", "message": "Channel Created Successfully" });
          });

        }); //db end

    }

    /*
      Function to edit channel
    */

    function editChannel( req, res, next ){

        var profilePic  = req.body.profile_pic;
        var bannerPic   = req.body.banner_pic; 
        var channelName = req.body.channel_name;
        var website     = req.body.website;
        var email       = req.body.email;
        var description = req.body.description;
        var channelid   = req.body.channelid;


        getDbIns.then(function (db) {

          var updatedAt = new Date();

          db.collection("channels").update({'_id': ObjectId(channelid)},
            {$set:{
              "profilePic"   : profilePic,
              "bannerPic"    : bannerPic,
              "channelName"  : channelName,
              "website"      : website,
              "email"        : email,
              "description"  : description,
              'updatedAt'    : updatedAt
            }});

          res.json({"success":"1", "message": "Channel Updated Successfully"});

        }); //db end
    }


     /*
    Function to get channel detail
    */
    function getChannelDetail( req, res, next ){

      var userId = req.body.userid;

      getDbIns.then(function (db) {

           db.collection("channels").find({userid: ObjectId(userId)}).toArray(function(err, channels) {
              if (err) {
                res.json({ "status":"0", "message": "Something went wrong" });
              } else {

                  res.json({"status":"1", "channels":channels});
                
              }         
           });


        }); //db end


    }


    /*
      Function to get channel list
    */

    function getChannelList( req, res, next ){

      getDbIns.then(function (db) {

           db.collection("channels").find().toArray(function(err, channels) {
              if (err) {
                res.json({ "status":"0", "message": "Something went wrong" });
              } else {

                  res.json({"status":"1", "channels":channels});
                
              }         
           });


        }); //db end

    }



    /*
      Function to upload channel Image ( for both profile and banner )
    */

    function uploadChannelProfileBannerImage( req, res, next ){


        var form = new formidable.IncomingForm();
        var file = null; // the uploaded file
        var uniqueAvatarName = randomString.generate(64) + '.jpg';
        var avatar = null; // the new avatar
        var oldAvatar = null; // in case we need to delete an older version
        var s3fsImplimentation = new s3fs('mongosocial-uploads/channel-pics', {
            accessKeyId: configApp.AWS_ACCESS_KEY_ID,
            secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-2'
        });

        // start the promise string
        var promise = new Promise(function (resolve, reject) {

        form.parse(req, function (err, fields, files) { 
          
            if (err) {
                return reject('Unable to upload the image');
            }

            // does the avatar file exist in the form?
            if (!files.avatar) {
                return reject('Please select an image to upload');
            }

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
                     Key: "channel-pics/"+oldAvatar
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
            res.json({"success":"1", "channel_photo": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/channel-pics/"+uniqueAvatarName});

      });

    }


   
 /*
      Function to upload channel videos
    */

    function uploadChannelVideos( req, res, next ){


        var s3fsImplimentation = new s3fs('mongosocial-uploads/channel-videos', {
            accessKeyId: configApp.AWS_ACCESS_KEY_ID,
            secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-2'
        });
    
        var file = req.files.video;

        var title      = req.body.title;
        var userId     = req.user._id;
        var channelid  = req.body.channelid;

        var extension = file.originalFilename.split(".");


        var uniqueVideoName = randomString.generate(64) + '.'+extension[2];
        //console.log(file);
        var stream = fs.createReadStream(file.path);
          return s3fsImplimentation.writeFile(uniqueVideoName, stream,{ACL: 'public-read'}).then(function () {
              fs.unlink(file.path, function (err) {
                  if (err) {
                      console.error(err);
                  }
              });

              getDbIns.then(function (db) {

              var createdAt = new Date();

              db.collection('videos').insertOne({
                  "userId"       : userId,
                  "channelid"    : ObjectId(channelid),
                  "title"        : title,
                  "videoUrl"     : uniqueVideoName,
                  "totalViews"   : "",
                  "createdAt"    : createdAt,
                  "updatedAt"    : createdAt
               }, function(err, result) {
                    assert.equal( err, null );
                    res.json({ "status":"1", "channel_video": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/channel-videos/"+uniqueVideoName });
              });

            }); //db end

        });

    }

   

 function uploadChannelImage( req, res, next ){


        var s3fsImplimentation = new s3fs('mongosocial-uploads/channel-image', {
            accessKeyId: configApp.AWS_ACCESS_KEY_ID,
            secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-2'
        });
    
        var file       = req.files.avatar;

        var title      = req.body.title;
        var userId     = req.user._id;
        var channelid  = req.body.channelid;

        var extension  = file.originalFilename.split(".");


        var uniqueAvatarName = randomString.generate(64) + '.'+extension[1];
       // console.log(extension[extension.length]);
        var stream = fs.createReadStream(file.path);
          return s3fsImplimentation.writeFile(uniqueAvatarName, stream,{ACL: 'public-read'}).then(function () {
              fs.unlink(file.path, function (err) {
                  if (err) {
                      console.error(err);
                  }
              });

              getDbIns.then(function (db) {

              var createdAt = new Date();

              db.collection('images').insertOne({
                "userId"        : userId,
                "channelid"     : ObjectId(channelid),
                "title"         : title,
                "imageUrl"      : uniqueAvatarName,
                "totalViews"    : "",
                "createdAt"     : createdAt,
                "updatedAt"     : createdAt
               }, function(err, result) {
                    assert.equal( err, null );
                    res.json({ "status":"1", "channel_image": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/channel-image/"+uniqueAvatarName });
              });

            }); //db end

        });

    }
     

    function addCommenttoVideoImageChannel( req, res, next ){
        
              var userId              = req.user._id;
              var videoimagechannelid = req.body.videoimagechannelid;
              var comment             = req.body.comment;
        
              getDbIns.then(function (db) {
        
                var createdAt = new Date();
        
                db.collection('comments').insertOne({
                    "userId"       : userId,
                    "videoimagechannelid" : ObjectId(videoimagechannelid),
                    "comment"      : comment,
                    "createdAt"    : createdAt,
                    "updatedAt"    : createdAt
                 }, function(err, result) {
                      assert.equal( err, null );
                      res.json({ "status":"1", "message": "Comment Added Successfully"});
                });
        
              }); //db end
        
            }


function getVideoList( req, res, next ){

        var userId    = req.user._id;
        var channelId = req.body.channelid;

        getDbIns.then(function (db) {

           db.collection("videos").find({channelid: ObjectId(channelId)}).toArray(function(err, videos) {
              if (err) {
                res.json({ "status":"0", "message": "Something went wrong" });
              } else {
                var response = [];
                if(videos.length){

                   
                   var count = 0;
                   videos.forEach(function(key, value){
                       
                        db.collection("comments").find({videoimageid: key._id}).toArray(function(err, comments) {
                            
                            response.push({
                              "_id":key._id,
                              "userid":key.userid,
                              "channelid":key.channelid,
                              "title":key.title,
                              "videoUrl":key.videoUrl,
                              "totalViews":key.totalViews,
                              "createdAt":key.createdAt,
                              "updatedAt":key.updatedAt,
                              "comments":comments
                            });
                             count++;
                            if( count == videos.length){
                              res.json({"status":"1", "videos":response});
                            }
                           
                        });
                    });
                    
                }else{
                  res.json({"status":"1", "videos": videos});
                }

                
              }         
           });


        }); //db end

    } 
 

   function getImageList( req, res, next ){

        var userId    = req.user._id;
        var channelId = req.body.channelid;

        getDbIns.then(function (db) {

          db.collection("images").find({channelid: ObjectId(channelId)}).toArray(function(err, images) {

              if (err) {

                res.json({ "status":"0", "message": "Something went wrong" });

              } else {

                var response = [];
                if(images.length){

                   
                   var count = 0;
                   images.forEach(function(key, value){
                       
                        db.collection("comments").find({videoimageid: key._id}).toArray(function(err, comments) {
                            
                            response.push({
                              "_id":key._id,
                              "userid":key.userid,
                              "channelid":key.channelid,
                              "title":key.title,
                              "imageUrl":key.videoUrl,
                              "totalViews":key.totalViews,
                              "createdAt":key.createdAt,
                              "updatedAt":key.updatedAt,
                              "comments":comments
                            });

                            count++;

                            if( count == images.length){
                              res.json({"status":"1", "images": response});
                            }
                           
                        });
                    });
                    
                }else{
                  res.json({"status":"1", "images": images});
                }

                
              }         
           });


        }); //db end

    }


    function uploadVideostatus( req, res, next ){
        
                var s3fsImplimentation = new s3fs('mongosocial-uploads/video-status', {
                    accessKeyId: configApp.AWS_ACCESS_KEY_ID,
                    secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY,
                    region: 'us-east-2'
                });
            
                var file = req.files.video;
        
                var status     = req.body.status;
                var userId     = req.user._id;
                
                var extension = file.originalFilename.split(".");
                // console.log(extension.length);
                // console.log(extension[extension.length -1 ]);
        
                var uniqueVideoName = randomString.generate(64) + '.'+extension[extension.length-1];
                //console.log(file);
                var stream = fs.createReadStream(file.path);
                  return s3fsImplimentation.writeFile(uniqueVideoName, stream,{ACL: 'public-read'}).then(function () {
                      fs.unlink(file.path, function (err) {
                          if (err) {
                              console.error(err);
                          }
                      });
        
                getDbIns.then(function (db) {
        
                       var createdAt = new Date();
        
                      db.collection("statuscomment").remove( {userId: ObjectId(userId) });

                      db.collection('videostatus').find({userId: ObjectId(userId)}).toArray(function(err, videostatus) {
                        console.log(videostatus.length)
                                    if( videostatus.length == 0 ){
                                      db.collection('videostatus').insertOne({
                                             "userId"       : userId,                           
                                             "status"       : status,
                                             "videoUrl"     : uniqueVideoName,
                                             "totalViews"   : "",
                                             "updatedAt"    : createdAt
                                       }, function(err, result) {
                                          assert.equal( err, null );
                                         //console.log( "Nooooooooo");
                                          res.json({ "status":"1", "video_status": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/video-status/"+uniqueVideoName});
                                      });
                                       
                                    }else{
                        
                                      db.collection('videostatus').update({userId: userId},
                                      {$set:{
                                         "userId"       : userId,                                     
                                         "status"       : status,
                                         "videoUrl"     : uniqueVideoName,
                                         "totalViews"   : "",
                                         "updatedAt"    : createdAt
                                      }});
                                        //console.log("yessssssss");
                                      res.json({"status":"1", "video_status": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/video-status/"+uniqueVideoName});
                                               
                                    }
                                              
                                  });
        
                    }); //db end
        
                });
        
            }
  
  
            function getVideoStatus(req, res, next) {
                var userId = req.user._id;
                        getDbIns.then(function (db) {
                //console.log(userId)
                           db.collection('videostatus').findOne({userId:ObjectId(userId)},function(err,url ) {
                              if (err) {
                                res.json({ "status":"0", "message": "Something went wrong" });
                              } else {
                              
                                  res.json({"status":"1", "videostatus":url});
                                
                              }         
                           });
                
                        }); //db end
                        
                    }
    

                    function getAllVideoStatus(req, res, next) {
                        var userId = req.user._id;
                                getDbIns.then(function (db) {
                        //console.log(userId)
                                   db.collection('videostatus').find({userId : { $nin: [ObjectId(userId)] }}).toArray(function(err,url ) {
                                      if (err) {
                                        res.json({ "status":"0", "message": "Something went wrong" });
                                      } 
                                      else{
                                 //console.log(url)
                                        var response = [];
                                        //console.log(url[0].userId)
                                        if(url.length){
      
                                          //console.log(url.length)
                                            var count = 0;
      
                                            url.forEach(function(key,value){    
                                                //console.log(key)
                                            var final = key.userId;
                                           //console.log(final)
      
                                      db.collection('friendslist').find({
                                        $and : [
                                                {$or:[{userId:ObjectId(final)},{friendId:ObjectId(final)}]},
                                                {$or:[{userId:ObjectId(userId)},{friendId:ObjectId(userId)}]}
                                               ]
                                      }).toArray(function(err,friends ) {
                                         //console.log(friends.length)
      
                                    if( friends.length > 0 ){
      
                                      friends.forEach(function(key1,value){
                                        response.push({                    
                                         // "userId"     : key.userId,
                                         // "friendId"   : key.friendId,                                                                         
                                         // "createdAt"  : key.updatedAt,                                                                                                                                                                                    
                                         // "userName"   : key.userName,
                                         "totalViews"    : key.totalViews,                                      
                                         "videoUrl"      : key.videoUrl,                       
                                         "userId"        : key.userId,                       
                                         "friendId"      : key1.friendId,
                                         "createdAt"     : key1.createdAt,
                                         "to"            : key1.to,
                                         "from"          : key1.from, 
                                         "Friendstatus" : key1.Friendstatus                          
                                       });
                                     })
                                    }
      
                                    else{   
                                                                    
                                           response.push({                    
                                             "userId"     : key.userId,
                                             "friendId"   : key.friendId,                                                                         
                                            // "createdAt"  : key.updatedAt,                                                                                                                                                                                    
                                            // "userName"   : key.userName,
                                            "totalViews"    : key.totalViews,                                      
                                            "videoUrl"      : key.videoUrl,                       
                                            "userId"        : key.userId,                       
                                            // "friendId"   : key1.friendId,
                                            // "createdAt"  : key1.createdAt,
                                            // "to"         : key1.to,
                                            // "from"       : key1.from, 
                                            "Friendstatus" : false                          
                                          });
                                        
                                      }
                                          count++;
                                        //console.log(friends)
                                      
      
                                        
      
                                     if(count == url.length){
                                      res.json({"status":"1", "friends":response});
                                     }
                                    
                                    
                                    });
                                  });
                                     
                                }          
                                  else {
                                      
                                          res.json({"status":"1", "videostatus":url});
                                        
                                      }         
                                                              
                                  }  
                                  });
                                }); //db end
                                
                            }


                             /*
      Function to add comment for video status
    */

    function addCommenttoVideostatus( req, res, next ){
        
              var s3fsImplimentation = new s3fs('mongosocial-uploads/status-comment', {
                accessKeyId: configApp.AWS_ACCESS_KEY_ID,
                secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY,
                region: 'us-east-2'
              });
          
                    var file          = req.files.video;
                    var textcomment   = req.body.textcomment;
              
                    var userId    = req.user._id;
                    var friendId  = req.body.friendId; 
        
                    var extension = file.originalFilename.split(".");
                    var uniqueVideoName = randomString.generate(64) + '.'+extension[extension.length-1];
              
                    var stream = fs.createReadStream(file.path);
                    return s3fsImplimentation.writeFile(uniqueVideoName, stream,{ACL: 'public-read'}).then(function () {
                        fs.unlink(file.path, function (err) {
                            if (err) {
                                console.error(err);
                            }
                        });
        
                    getDbIns.then(function (db) {
              
                      var createdAt = new Date();
              
                      db.collection('statuscomment').insertOne({
                          "userId"           : userId,
                          "friendId"         : ObjectId(friendId),
                          "videocomment_url" : "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/status-comment/"+uniqueVideoName,
                          "textcomment"      : textcomment,
                          "createdAt"        : createdAt,
                       }, function(err, result) {
                            assert.equal( err, null );
                            res.json({ "status":"1", "message": "Comment Added Successfully", "comment_url": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/status-comment/"+uniqueVideoName});
                      });
              
                    }); //db end
                  
                });
                 
            }
        
            function addTextCommenttoVideostatus( req, res, next ){
              
                    var userId        = req.user._id;
                    var friendId      = req.body.friendId;
                    var textcomment   = req.body.textcomment;
              
                    getDbIns.then(function (db) {
              
                      var createdAt = new Date();
              
                      db.collection('statuscomment').insertOne({
                          "userId"       : userId,
                          "friendId"     : ObjectId(friendId),
                          "textcomment"  : textcomment,
                          "createdAt"    : createdAt,
                       }, function(err, result) {
                            assert.equal( err, null );
                            res.json({ "status":"1", "message": "Comment Added Successfully"});
                      });
              
                    }); //db end
              
                  }
        
        
            function getcommentOnVideoStatus(req, res, next) {
              
              var friendId = req.body.friendId;
                getDbIns.then(function (db) {
              //console.log(friendId)
                db.collection('statuscomment').find({friendId:ObjectId(friendId)}).toArray(function(err,url ) {
                   // console.log(url)
                    if (err) {
                        res.json({ "status":"0", "message": "Something went wrong" });
                    } else {
                                       
                            var response = [];
                            if(url.length){
                                                                                           
                                var count = 0;
                               url.forEach(function(key, value){
                                          //console.log(key.textcomment)                 
                                db.collection("users").find({_id:ObjectId(key.friendId)}).toArray(function(err, user) {
                                                   //console.log(user) 
                                
                                user.forEach(function(key1, value){
                                    response.push({
                                    "userId":key.userId,
                                    "friendId":key.friendId,
                                    "textcomment":key.textcomment,
                                    "createdAt":key.createdAt,
                                    "videocomment_url":key.videocomment_url,
                                    "email":key1.email,
                                    "userName":key1.userName,
                                    "profile_photo":key1.profile_photo,
                                    "email":key1.email,
                                    "dob":key1.dob,
                                    "currentAge":key1.currentAge,
                                    "occupation":key1.occupation,
                                    "city":key1.city,
                                    
                                    })
                                });
                                    count++;
                                   
                                    if( count == url.length){
                                        //sorting array according to time
                                        response.sort(function(a, b) {
                                            return (a.createdAt < b.createdAt) ? -1 : ((a.createdAt > b.createdAt) ? 1 : 0);
                                        });
                                        res.json({"status":"1", "comments": response});
                                    }
                                                               
                                });
                                })//loop
                                                        
                            }else{
                                res.json({"status":"1", "comments": url});
                                }                                                                                  
                                //res.json({"status":"1", "comments":url});                              
                            }         
                         });              
                      }); //db end
                      
                  }


  
  function getChannelsVideoImageComments( req, res, next ){
    
   var userId    = req.user._id;
     
    getDbIns.then(function (db) {

    
   
 db.collection("channels").aggregate([
    {$match: {userid : { $nin: [ObjectId(userId)] }}},
    {
        $out:"tmpchannels"
    }

])
         
          db.collection("tmpchannels").aggregate([ 
            
          {$lookup:{from:"videos", localField:"userid", foreignField:"userId", as:"videos"}}, 
          //{$lookup:{from:"images", localField:"userid", foreignField:"userId", as:"images"}},
          //{$lookup:{from:"comments", localField:"userid", foreignField:"userId", as:"images"}},
                    
          {$project: {userid:1,profilePic:1,channelName:1,description:1,
            videos: { $arrayElemAt: [ "$videos", 0 ]},
            //images: { $arrayElemAt: [ "$images", 0 ]},  
          }} 
        
        
        
        
          
          
          
          ]).toArray(function(err,result){//console.log(result)
            res.json({"status":"1", "channels": result});
            

            })
         
    }); //db end
    
} 




function getChannelsVideosComments( req, res, next ){
    
   var userId    = req.user._id;
   
    
   getDbIns.then(function (db) {
                                                      
      db.collection("channels").find({userId : { $nin: [ObjectId(userId)] }}).toArray(function(err, channels) { 
    //console.log(channels)
      if (err) {
        res.json({ "status":"0", "message": "Something went wrong" });
      } else {
          var response1 = [];     
      if(channels.length > 0){
            var global = [];
            var count = 0;
            channels.forEach(function(key1, value){
              //console.log(key1._id)
     
      
      function queryCollection(collection, callback){
        var collection=  db.collection("videos").find({channelid: key1._id}).toArray(function(err, videos) {
                      //console.log(images)
              if (err) {
  
                res.json({ "status":"0", "message": "Something went wrong" });
  
              } else {
  
                var response = [];
                
                if(videos.length > 0){
  
                   
                   var count = 0;
                   videos.forEach(function(key, value){
                       
                        db.collection("comments").find({videoimagechannelid: key._id}).toArray(function(err, comments) {
                            //console.log(comments)
                            response.push({
                              "_id":key._id,
                              "userid":key.userId,
                              "channelid":key.channelid,
                              "title":key.title,
                              "videoUrl":key.videoUrl,
                              "totalViews":key.totalViews,
                              "createdAt":key.createdAt,
                              "updatedAt":key.updatedAt,
                              "comments":comments
                            });
                            // console.log(count)
                            count++;
  
                            if( count == videos.length){
                               global=response;                         
                                 //console.log(global)
                                 callback(global)                                                       
                              //res.json({"status":"1", "images": response1});                                                    
                            }
                           
                        }); 
                    });
                    
                 }
                else{
                  callback(global)
                return
                 }
  
                
              }         
            });//db
          }
                        
           
          
          var collection = queryCollection(collection, function(global){
                  //console.log(global)
                  response1.push({
                    "channelid": key1._id,
                    "channelName":key1.channelName,
                     "videos":global
                     })
                     //console.log(global);
                      //console.log(response1);
                      //res.json({"status":"1", "channels": response1});    
                      count++
                      if(count == channels.length){                                             
                      res.json({"status":"1", "channels": response1});
                      }
              });
                
    })                                  
      }else{
         res.json({"status":"1", "channels": channels});
          }
  
      }
          
         
    });//db
           
  }); //db end
    
  }


function getChannelsImagesComments( req, res, next ){
    
   var userId    = req.user._id;
   
    
   getDbIns.then(function (db) {
                                                      
      db.collection("channels").find({userId : { $nin: [ObjectId(userId)] }}).toArray(function(err, channels) { 
    //console.log(channels)
      if (err) {
        res.json({ "status":"0", "message": "Something went wrong" });
      } else {
          var response1 = [];     
      if(channels.length > 0){
         var global = [];
       var count = 0;
        channels.forEach(function(key1, value){
              //console.log(key1._id)
     
      
      function queryCollection(collection, callback){
        var collection=  db.collection("images").find({channelid: key1._id}).toArray(function(err, images) {
                      //console.log(images)
              if (err) {
  
                res.json({ "status":"0", "message": "Something went wrong" });
  
              } else {
  
                var response = [];
                
                if(images.length > 0){
  
                   
                   var count = 0;
                   images.forEach(function(key, value){
                       
                        db.collection("comments").find({videoimagechannelid: key._id}).toArray(function(err, comments) {
                            //console.log(comments)
                            response.push({
                              "_id":key._id,
                              "userid":key.userId,
                              "channelid":key.channelid,
                              "title":key.title,
                              "imageUrl":key.imageUrl,
                              "totalViews":key.totalViews,
                              "createdAt":key.createdAt,
                              "updatedAt":key.updatedAt,
                              "comments":comments
                            });
                            // console.log(count)
                            count++;
  
                            if( count == images.length){
                               global=response;                         
                                 //console.log(global)
                                 callback(global)                                                       
                              //res.json({"status":"1", "images": response1});                                                    
                            }
                           
                        }); 
                    });
                    
                 }
                else{
                  callback(global)
                return
                 }
  
                
              }         
            });//db
          }
                        
           
          
          var collection = queryCollection(collection, function(global){
                  //console.log(global)
                  response1.push({
                    "channelid": key1._id,
                    "channelName":key1.channelName,
                     "images":global
                     })
                     //console.log(global);
                      //console.log(response1);
                      //res.json({"status":"1", "channels": response1});    
                      count++
                      if(count == channels.length){                                             
                      res.json({"status":"1", "channels": response1});
                      }
              });
                
    })                                  
      }else{
         res.json({"status":"1", "channels": channels});
          }
  
      }
          
         
    });//db
           
  }); //db end
    
  }


})();