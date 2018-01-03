(function() {

	'use strict';
	
	var configApp = require('./config/app')[process.env.NODE_ENV || 'development'];
	var serverService = require('./app/services/ServerService');

	var app         = serverService.app;
	var bodyParser  = require('body-parser');
	var compression = require('compression');
	var http        = serverService.http;
	var morgan      = require('morgan');
	var envs        = require('envs');
	//11.05.2017
	var multer      = require('multer');

	var express     = require('express');
	//end

	//var fs 		= require('fs');
	var routes      = require('./app/routes');
    var Promise 	= require('bluebird');
    Promise.config({
		longStackTraces: true
    });
  
	/**
	 * For development logging
	 */
	app.use(morgan('dev'));
	                                       
	/**
	 * Compress all files 
	 */
	app.use(compression());

	// EJS template engine

	app.use(express.static(`${__dirname}/public`));

	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb',extended: false, parameterLimit: 1000000}));
	//app.use(bodyParser.json());
	app.set('views', `${__dirname}/views`);
	app.set('view engine', 'ejs');




	//app.use(bodyParser({limit: '50mb'}));

	/**
	 * All routes
	 */
	app.use('/', routes);

	/**
	 * Sockets
	 */
	require('./app/sockets.js');

	/**
	 * EB handles this on the servers
	 */
	app.set('port', process.env.PORT || configApp.PORT);

	/**
	 * Start the API Server
	 */
	http.listen(app.get('port'), function() {
		console.log('API PORT: ' + app.get('port') + ' ENVIRONMENT: ' + configApp.ENVIRONMENT);
	});

	app.timeout = 1000 * 60 * 10; // 10 min
	
})();
