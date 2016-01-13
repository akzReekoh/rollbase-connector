'use strict';

var platform = require('./platform'),
	username, password, loginUrl;

platform.on('data', function (data) {

	var _     = require('lodash'),
		async = require('async'),
		request = require('request');

	async.waterfall([

		function (cb) {

			var options = {
				url: loginUrl.concat('/rest/api/login?loginName=', username, '&password=', password, '&output=json'),
				method: 'GET',
				json: true
			};

			request(options, function (error, response, body) {

				var sessionId = _.get(body, 'sessionId');

				if (error)
					cb(error);
                else
				    cb(null, sessionId);
			});
		},

		function (sessionId, cb) {

			var formData = {
				sessionId: sessionId,
				useIds: false,
				output: 'json'
			};

			_.forIn(data, function (value, key) {
				formData[key] = value;
			});

			var options = {
				url: loginUrl.concat('/rest/api/create2'),
				method: 'POST',
				form: formData
			};

			request(options, function (error, response, body) {

				if (error)
					cb(error);
				else
					cb(null, sessionId, body);
			});
		},

		function (sessionId, body, cb) {

			var options = {
				url: loginUrl.concat('/rest/api/logout?sessionId=', sessionId, '&output=json'),
			    method: 'GET'
			};

			request(options, function (error, response, body) {

				cb(null, body);
			});
		}
	]);
});

platform.once('close', function () {
	let d = require('domain').create();

	d.once('error', function(error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
		d.exit();
	});

	d.run(function() {
		platform.notifyClose(); // Notify the platform that resources have been released.
		d.exit();
	});
});

platform.once('ready', function (options) {

	username = options.username;
	password = options.password;
	loginUrl = options.login_url;

	platform.notifyReady();
	platform.log('Rollbase Connector has been initialized.');

});