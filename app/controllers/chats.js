(function (){
    
       'use strict';
      
      var configApp    = require('../../config/app')[process.env.NODE_ENV || 'development'];
      var getDbIns     = require('../../database/index');
      
      var assert       = require('assert');
      var ObjectId     = require('mongodb').ObjectID;
      var s3fs         = require('s3fs');
      var fs           = require('fs');
      var AWS          = require('aws-sdk');
      var randomString = require('randomstring');
     
    
      AWS.config.update({
         accessKeyId: configApp.AWS_ACCESS_KEY_ID
       , secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY
       , region: 'us-east-2'
      });
       var s3       = new AWS.S3();
   
      
       exports.sendchat    = sendchat;
       exports.retriveAllchat = retriveAllchat;
       exports.retriveuniquechat = retriveuniquechat;
   
   
       function sendchat( req,res,next ){
   
           var s3fsImplimentation = new s3fs('mongosocial-uploads/video-chats', {
               accessKeyId: configApp.AWS_ACCESS_KEY_ID,
               secretAccessKey: configApp.AWS_SECRET_ACCESS_KEY,
               region: 'us-east-2'
           });
       
           var file = req.files.video;
           var file1 = req.files.image; 

           var userId   = req.user._id;
           var from     = req.body.from;
           var to       = req.body.to;
           var del_from = req.body.del_from;
           var del_to   = req.body.del_to;
   
           var extension = file.originalFilename.split(".");
           var extension1 = file1.originalFilename.split(".");
           //console.log(extension)
           //console.log(extension.length);
           //console.log(extension[extension.length -1 ]);
   
           var uniqueVideoName = randomString.generate(64) + '.'+extension[extension.length-1];
           var uniqueVideoName1 = randomString.generate(64) + '.'+extension1[extension1.length-1];
          // console.log(file);
          //console.log(file1);
           var stream = fs.createReadStream(file.path);
           var stream1 = fs.createReadStream(file1.path);
             return s3fsImplimentation.writeFile(uniqueVideoName, stream,{ACL: 'public-read'}).then(function () {
                return s3fsImplimentation.writeFile(uniqueVideoName1, stream1,{ACL: 'public-read'}).then(function () {
                 fs.unlink(file.path, function (err) {
                    fs.unlink(file1.path, function (err) {
                     if (err) {
                         console.error(err);
                     }
                    });
                    });
                 
   
           getDbIns.then(function (db) {  
               var createdAt = new Date();  
           
               db.collection('chats').insertOne({
                   "userId"       : userId,
                   "from"         : ObjectId(from),
                   "to"           : ObjectId(to),
                   "videomsg"     :uniqueVideoName,
                   "thumbnail"    :uniqueVideoName1,
                   "updatedAt"    : createdAt,
                   "status"       :"unread",
                   "del_from"     : del_from,
                   "del_to"       : del_to
                             
               },function(err, result) {
                   assert.equal( err, null );
                   res.json({ "status":"1", "video_msg": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/video-chats/"+uniqueVideoName,
                   "thumbnail":"https://s3-us-east-2.amazonaws.com/mongosocial-uploads/video-chats/"+uniqueVideoName1});
                   //res.json({ "status":"1", "thumbnail": "https://s3-us-east-2.amazonaws.com/mongosocial-uploads/video-chats/"+uniqueVideoName1});
               });
   
   
           }); //db end
       
        });       
        });
       }
   
   
   
   
   
       function retriveAllchat( req,res,next ){
       
       var userId = req.user._id;
       var from =req.body.from;
       var to =req.body.to;
   
           getDbIns.then(function (db) {   
               var createdAt = new Date();
   
               db.collection('chats').find({$or:[{userId:ObjectId(userId)},{from:ObjectId(from)},{to:ObjectId(to)}]}).toArray(function(err,allchats){
                   if(err){
                         res.json({ "status":"0", "message": "NO chats between users exists" });
                       }
                      else{
                       res.json({"status":"1", "Allchats":allchats});
                      }
       
           });
       
       });
    
      }
   
      function retriveuniquechat( req,res,next ){
       
       var userId = req.user._id;
       var from =req.body.from;
       var to =req.body.to;
   //console.log(from)
   //console.log(to)
   
           getDbIns.then(function (db) {   
               var createdAt = new Date();
   
               db.collection('chats').find({
                   $and:[
                    {$or : [{userId:ObjectId(userId)},{from:ObjectId(userId)}]},
                    {$or : [{to:ObjectId(to)},{to:ObjectId(to)}]}
                   ]
           }).toArray(function(err,alluniquechats){
                   if(err){
                         res.json({ "status":"0", "message": "Something went wrong or NO chats between users exists" });
                       }
                      else{
                       res.json({"status":"1", "chat_history":alluniquechats});
                      }
       
           });
       
       });
    
      }
   
   
   })();