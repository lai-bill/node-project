var express = require('./express.dev');

var app = require('connect')()
	.use(require('vhost')('127.0.0.1', express))
	.use(require('cookie-parser')('tobi is a cool farret'))
	.use(function (req, res) {

		res.setHeader('Set-Cookie', 'tobi=ferret');
		res.setHeader('Set-Cookie', 'foo=bar');


		console.log(req.cookies);
		console.log(req.signedCookies);

		res.end('hello');

	}).listen(8080);