var http = require("http");
var fs = require("fs");
var events = require("events");

var server = http.createServer(function(req, res) {
	var reqBody = {
		count: 0,
		body: null,
		data: null
	}

	fs.readFile("./title.json", function(err, data) {
		if (err) return listRequestEvent(err);
		reqBody.count++;
		reqBody.data = data.toString('UTF8');
	});

	fs.readFile("./public/index.html", function(err, data) {
		if (err) return listRequestEvent(err);
		reqBody.body = data.toString('UTF8');
		reqBody.count++;
		listRequestEvent();
	});

	function listRequestEvent(err) {
		if (err) return res.end("Server Error");
		if (reqBody.count !== 2) return;
		res.writeHeader(200, {"Content-Type": "text/html;charset=UTF8"});
		res.end(reqBody.body.replace('%', JSON.parse(reqBody.data).join("</li><li>")));
	}
});


server.listen(8000);

//访问服务器静态文件
console.log("Server running at http://localhost:8000/");