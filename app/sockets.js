/*(function() {

    'use strict';

    var db = require('../database/models/index');
    var validator = require('./services/ValidatorService');
    var serverProvider = require('./services/ServerService');

    var io = serverProvider.io;*/

    /**
     *
     * Examples for socket.io
     *
     * socketIO.to(socket.id).emit('moo'); // message to specific user, socket.id is req.session.socketId
     * socketIO.to('main room').emit('moo'); // message to room
     * socketIO.sockets.connected[socket.id].join('main room');
     *
     */
    //io.on('connection', function(socket) {
		 
        /**
         *
         * This will add the user to their organization's room
         * so that if a new message comes in for the org they will
         * be notified
         *
         */

        /*socket.on('join room', function(organizationId, userId) {
            // validated both inputs
            if (!validator.isInt(organizationId + '') || !validator.isInt(userId + '')) {
                return;
            }

            // locate the user and organization
            db.organizationUser.findOne({
                where: {
                    organizationId: organizationId,
                    userId: userId
                }
            }).then(function(foundOrganizationUser) {
                if (!foundOrganizationUser) {
                    return;
                }

                // all good, have the user join the organization's room
                socket.join(organizationId);

            }).catch(function(error) {
                // do nothing
            });
        });


        
    });

})();*/