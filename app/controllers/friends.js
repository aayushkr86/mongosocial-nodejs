(function (){
    
       'use strict';
      
      var configApp    = require('../../config/app')[process.env.NODE_ENV || 'development'];
      var getDbIns     = require('../../database/index');
      var assert       = require('assert');
      var ObjectId     = require('mongodb').ObjectID;
   
   
       exports.savefriends    = savefriends;
       exports.retrivefriends = retrivefriends;
   
       function savefriends( req,res,next ){
        
            var userId    = req.user._id;
            var friendId  = req.body.friendId;
            var to        = req.body.to; 
            var from      = req.body.from;
            
 
            getDbIns.then(function (db) {  
                var createdAt = new Date();  
            
                db.collection('friendslist').insertOne({
                  
                    "userId"       : userId,
                    "friendId"     : ObjectId(friendId),
                    "to"           : ObjectId(to),
                    "from"         : ObjectId(from),
                    "updatedAt"    : createdAt,
                    "Friendstatus" : true
                 
                },function(err, result) {  //console.log(result)
                    assert.equal( err, null );
                    res.json({ "status":"1", "message": "friend Added Successfully"});
                });
       
                db.collection('followers').insertOne({
                 "userId"       : ObjectId(friendId),
                 "friendId"     : userId,
                 "status"       : "following"
                 
               },function(err, result) {  
                   assert.equal( err, null );
                   //res.json({ "status":"1", "message": "follower Added Successfully"});
               });
 
            }); //db end
         }


       function retrivefriends( req,res,next ){
        
        var userId = req.user._id;
        //var friendId = req.body.friendId;
        //console.log(userId)
            getDbIns.then(function (db) {   
                var createdAt = new Date();
    
                db.collection('friendslist').find({ "Friendstatus" : true},{
                    $and :[
                          {$or:[{userId:ObjectId(userId)},{friendId:ObjectId(userId)}]},
                          {$or:[{userId:{ $nin: [ObjectId(userId)] }},{friendId:{ $nin: [ObjectId(userId)] }}]}
                          ]
                     }).toArray(function(err, allfriends){
                     //console.log(allfriends)
                    
                     if(err){
                          res.json({ "status":"0", "message": "Something went wrong" });
                        }
                       else{
                        
                        var response = [];
                        
                        if(allfriends.length){
                           //console.log(allfriends.length)
                           
                           var count = 0;
                           allfriends.forEach(function(key, value){
                               //console.log(key)
                               
                                db.collection("users").find({_id: key._id }).toArray(function(err, friend) {
                                    //console.log(friend)
                                    
                                    if( friend.length > 0 ){ 

                                    friend.forEach(function(key1,value){ //console.log(key1)
                                    
                                      response.push({

                                      "_id"          : key._id,                                   
                                      "fullName"     : key1.fullName,
                                      "userName"     : key1.userName,
                                      "email"        : key1.email,
                                      "dob"          : key1.dob,
                                      "currentAge"   : key1.currentAge,
                                      "occupation"   : key1.occupation,
                                      "city"         : key1.city,
                                      "state"        : key1.state,
                                      "touchid"      : key1.touchid,
                                      "profile_photo": key1.profile_photo,
                                      "status"       : key1.status,
                                      "createdAt"    : key1.createdAt,
                                      "updatedAt"    : key1.updatedAt,
                                      "sessionID"    : key1.sessionID,
                                      "tokenID"      : key1.tokenID,
                                      "deviceToken"  : key1.deviceToken,
                                      "expiredAT"    : key1.expiredAT
                                      
                                      
                                    });
                                })
                            }
        
                                    count++;
        
                                    if( count == allfriends.length){
                                      res.json({"status":"1", "friend": response});
                                    }
                                   
                                });
                            });
                            
                        }else{
                          res.json({"status":"1", "Allfriends": allfriends});
                        }
                                
                        //res.json({"status":"1", "Allfriends":allfriends});
                       }
                    
            });
        
        });
     
        }
   
    
   })();