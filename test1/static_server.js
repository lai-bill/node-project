var join = require('path').join;
var parse = require('url').parse;
var fs = require('fs');
var qs = require("querystring");
var handleUpload = require('./util/UploadFile');
var root = __dirname + '/public';
var items = [];
var formidable = require('formidable');
var sockets = {};
var sendSocket = null;

var server = require('http').createServer(function(req, res) {
	console.log(req.url);
	if (req.url !== '/') return staticFileRead(req, res);

	req.method === "GET" ?
		showIndex(req, res) : req.method === "POST" ?
		addItem(req, res) : err404(req, res);
}).listen(8080);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	var __key = new Date().getTime();
	sockets[__key] = socket;
	socket.emit('unicom', __key);
	socket.on('showProgress', function() {
		sendSocket = socket;
	});
});

function showIndex(req, res) {
	var html = '<!doctype html>\
				<html lang="en">\
				<head>\
					<meta charset="UTF-8">\
					<title>Document</title>\
				</head>\
				<body>\
					<h1>Latest Posts</h1>\
					<ul>' +
						items.map(function(item, index) {
							return ('<li>' + item.item +'<img src="' + item.img +'"></li>');
						}).join('') +
					'</ul>\
					<form action="/" method="POST" enctype="multipart/form-data">\
						<input type="text" name="item" />\
						<input name="img" type="file" />\
						<input type="submit" name="asdasd" id="submit" />\
					</form>\
					<script src="/socket.io/socket.io.js"></script>\
					<script>\
						var subBtn = document.querySelector("#submit");\
						var socket = io.connect("http://localhost:8080/");\
						subBtn.addEventListener("click", preventSubmit);\
						function preventSubmit(ev) {\
							ev.preventDefault();\
							return false;\
						}\
						socket.on("unicom", function(__key) {\
							console.log(__key);\
							subBtn.removeEventListener("click", preventSubmit);\
							socket.emit("showProgress", __key);\
							socket.on("progress", function(data) {\
								console.log(data);\
							});\
						});\
					</script>\
				</body>\
				</html>';
	res.setHeader('Content-Type', 'text/html;charset=UTF8');
	res.setHeader('Content-Length', Buffer.byteLength(html));
	res.statusCode = 200;
	res.end(html);
}

function addItem(req, res) {
	
	var item = {};
	var form = new formidable.IncomingForm({uploadDir: './public'});

	form.on('field', function(field, value) {
		item[field] = value;
	});

	form.on('file', function(name, file) {
		item[name] = file.path.substr(file.path.indexOf("\\") + 1);
	});

	form.on('end', function(name, file) {
		items.push(item);
//		showIndex(req, res);
	});

	form.on('progress', function(uploadSize, fileSize) {
		var percent = Math.floor(uploadSize / fileSize * 100);
		sendSocket.emit('progress', percent);
		console.log(percent)
	});

	form.parse(req);	
}



function err404(req, res) {
	res.statusCode = 404;
	res.end('Not Found');
}


function staticFileRead(req, res) {
	var pathname = join(root, parse(req.url).pathname);
	fs.stat(pathname, function(err, data) {
		if (err) {
			if (err.code === 'ENOENT') {
				res.statusCode = 404;
				res.end('Not Found');
			} else {
				res.statusCode = 500;
				res.end('Internal Server Error');
			}
			return;
		}
		res.setHeader('Content-Length', data.size);
		var stream = fs.createReadStream(pathname);
		stream.on('error', function() {
			res.statusCode = 500;
			res.end('Internal Server Error');
		});

		stream.pipe(res);
	});
}