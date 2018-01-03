(function () {

    'use strict';

    var app  = require('express')();
    var cors = require('cors');

    var controllers = require('./controllers');
    var parametersService = require('./services/URLParametersService');
    var requests = require('./requests');

    const R          = require('ramda');


    var multiparty = require("connect-multiparty");

    var multipartyMiddleware = multiparty();

    module.exports = app;

    /** Services */
const opentok   = require('././services/opentok-api'); 
const broadcast = require('././services/broadcast-api'); 


	
    /**
     * To allow API calls from restricted domains
     */
    var whitelist = [
        'http://localhost:7250',
        'http://api.allmongo.com'
    ];

    var corsOptions = {
        origin: function (origin, callback) {
            var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        },
        preflightContinue: false,
        credentials: true
    };
    app.use(cors(corsOptions));

    /**
     * Routing Parameters
     * Common variables used in the URL
     */
    app.param('hash', parametersService.validateHash);
    app.param('id', parametersService.validateId);

    /**
     * Welcome to the Mongosocial API
     * and general open routes
     */
    app.get('/', controllers.App.getIndex);
    app.get('/api', controllers.App.getIndex);
    app.get('/api/health', controllers.App.getHealth);


    app.get('/api/save', controllers.App.saveData);


    
    app.post('/api/register-user', controllers.User.registerUser);
    app.post('/api/login-user', controllers.User.loginUser);

    /*============================================
     =            Authenticated Routes            =
     ============================================*/

    
    app.get('/api/delete-object', controllers.User.deleteObject);


    //broadcast url

    app.get('/viewer', (req, res) => {
	  opentok.getCredentials('viewer')
	    .then(credentials => res.render('pages/viewer', { credentials: JSON.stringify(credentials) }))
	    .catch(error => res.status(500).send(error));
	});

	app.get('/host', (req, res) => {
	  opentok.getCredentials('host')
	    .then(credentials => res.render('pages/host', { credentials: JSON.stringify(credentials) }))
	    .catch(error => res.status(500).send(error));
	});

	app.get('/guest', (req, res) => {
	  opentok.getCredentials('guest')
	    .then(credentials => res.render('pages/guest', { credentials: JSON.stringify(credentials) }))
	    .catch(error => res.status(500).send(error));
	});

	app.get('/broadcast', (req, res) => {
	  const url = req.query.url;
	  const availableAt = req.query.availableAt;
	  res.render('pages/broadcast', { broadcast: JSON.stringify({ url, availableAt }) });
	});

	/*
	 * API Endpoints
	 */
	

    //end

    
    app.use(controllers.Auth.isAuthenticated);



    //Channel API
    app.post('/api/create-channel', controllers.Channel.createChannel); 
    app.post('/api/edit-channel', controllers.Channel.editChannel);
    app.post('/api/upload-channel-profile-banner-image', controllers.Channel.uploadChannelProfileBannerImage);
    app.get('/api/get-channel-list', controllers.Channel.getChannelList);
    app.post('/api/get-channel-detail', controllers.Channel.getChannelDetail);
    app.post('/api/upload-channel-image', multipartyMiddleware, controllers.Channel.uploadChannelImage);
    app.post('/api/upload-channel-videos', multipartyMiddleware, controllers.Channel.uploadChannelVideos);
    app.post('/api/add-comment-to-video-image-channel', controllers.Channel.addCommenttoVideoImageChannel);
    app.post('/api/get-video-list', controllers.Channel.getVideoList);
    app.post('/api/get-image-list', controllers.Channel.getImageList);

    app.post('/api/upload-videostatus',multipartyMiddleware,controllers.Channel.uploadVideostatus);
    app.get('/api/get-video-status', controllers.Channel.getVideoStatus);
    app.get('/api/getAll-video-status', controllers.Channel.getAllVideoStatus);
    app.post('/api/add-comment-to-video-status',multipartyMiddleware,controllers.Channel.addCommenttoVideostatus);
    app.post('/api/add-text-comment-to-video-status',controllers.Channel.addTextCommenttoVideostatus);
    app.post('/api/get-comment-on-video-status', controllers.Channel.getcommentOnVideoStatus);
    
    app.get('/api/get-channels-videoImage-comments', controllers.Channel.getChannelsVideoImageComments);//not working
    app.get('/api/get-channels-videos-comments', controllers.Channel.getChannelsVideosComments);
    app.get('/api/get-channels-images-comments', controllers.Channel.getChannelsImagesComments);

    //User API
    app.post('/api/upload-profile', controllers.User.uploadProfile);
    app.get('/api/user-list', controllers.User.userList);
    app.get('/api/user-detail', controllers.User.userDetail);
    app.get('/api/change-user-status', controllers.User.changeUserStatus);
    
    app.post('/api/follow-channel-or-user', controllers.User.followChannelOrUser);
    app.post('/api/unfollow-channel-or-user', controllers.User.unFollowChannelOrUser);
    app.get('/api/get-notification', controllers.User.getNotification);
    app.post('/api/update-notification-status', controllers.User.updateNotificationStatus);
    app.post('/api/get-subscriber-list', controllers.User.getSubscriberList);
    app.post('/api/get-subscribed-list', controllers.User.getSubscribedList); 

    app.post('/api/edit-profile', controllers.User.editProfile);
    app.post('/api/block-user', controllers.User.blockuser);
    app.get('/api/get-blockeduser-list', controllers.User.getblockeduserlist);
    app.post('/api/unblock-user', controllers.User.unblockuser);




    //Notification API
    app.post('/api/send-push-notification', controllers.Notification.sendPushNotification);

    app.post('/broadcast/start', (req, res) => {
      
      const sessionId = R.path(['body', 'sessionId'], req);
      const streams = R.path(['body', 'streams'], req);
      const rtmp = R.path(['body', 'rtmp'], req);
      
      broadcast.start(sessionId, streams, rtmp)
        .then(data => res.json(data))
        .catch(error => res.status(500).send(error));
        
    });

    app.post('/broadcast/layout', (req, res) => {
      const streams = R.path(['body', 'streams'], req);
      broadcast.updateLayout(streams)
        .then(data => res.send(data))
        .catch(error => res.status(500).send(error));
    });

    app.post('/broadcast/end', (req, res) => {
      broadcast.end()
        .then(data => res.send(data))
        .catch(error => res.status(500).send(error));
    });


  //Session and Token API
  app.get('/api/create-token', controllers.Token.createToken);
  app.post('/api/refresh-token', controllers.Token.refreshToken);


 //Chat API
 app.post('/api/send-chat',multipartyMiddleware,controllers.chats.sendchat);
 app.get('/api/retriveAll-chat',controllers.chats.retriveAllchat);
 app.post('/api/retriveunique-chat',controllers.chats.retriveuniquechat);



 //Friend API
 app.post('/api/save-friend',controllers.friends.savefriends);
 app.get('/api/get-friendlist',controllers.friends.retrivefriends);


	 
    /*==============================
     =            ERRORS            =
     ==============================*/

   // app.use(controllers.Errors.errorNotFound); 
    app.use(controllers.Errors.errorCatchAll);

})();
