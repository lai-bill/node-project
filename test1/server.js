var http = require('http');
var EventEmitter = require('events').EventEmitter;
var iconv = require("iconv-lite");

var handle = new EventEmitter();
var items = [];

var server = http.createServer(function(req, res) {
	console.log('emit is', req.method + "_" + req.url);
	handle.emit(req.method + '_All', req, res);
	handle.emit(req.method + '_' + req.url, req, res);

	var id = Number(req.url.slice(req.url.lastIndexOf('/') + 1));
	if (id) {
		req.lastId = id
		handle.emit(req.method + '_Math', req, res);
	}
});


handle.on('GET_/', function(req, res) {
	var body = "欢迎登录本网站";
	console.log(body);
	res.setHeader('Content-Type', 'text/html;charset=UTF8');
	res.setHeader('Content-Length', Buffer.byteLength(body));

	res.end(body);
});

handle.on('POST_/', function(req, res) {

	req.on('data', function(item) {
		items.push(item)
	});

	req.on('end', function() {
		var body = items.map(function(item, i) {
			return i + ')' + item;
		}).join("\n")		//遍历每一项并修改当前项

		res.setHeader('Content-Type', 'text/html;charset=UTF8');
		res.setHeader('Content-Length', Buffer.byteLength(body));
		res.end(body);
	});
});

handle.on('DELETE_Math', function(req, res) {
	console.log(req.lastId)
	if (!items[req.lastId]) {
		res.statusCode = 404;
		res.end('error 404 url');
		return;
	}

	items.splice(req.lastId, 1);
	res.end('OK\n');
})
server.listen(8080);