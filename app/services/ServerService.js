(function() {

	'use strict';

	var app = require('express')();
	var http = require('http').createServer(app);
	var io = require('socket.io')(http);

	module.exports.app = app;
	module.exports.http = http;
	module.exports.io = io;

})();