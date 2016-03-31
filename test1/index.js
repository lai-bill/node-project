var http = require("http");
var fs = require("fs");
var mime = require("mime");

var cache = {};

var server = http.createServer(function(req, res) {
	res.writeHead(200, {"Content-Type": "application/x-img"});
	fs.createReadStream("./imgs/ly.jpg").pipe(res);    //里面设有end事件
});



//访问服务器静态文件
function serverStatic(request, response, absPath) {
	
	//当有请求路径是查看缓存中是否有该文件
	if (cache[absPath]) {
		return sendFile(response, absPath, cache[absPath]);
	}

	//查看服务器是否有改文件
	fs.exists(absPath, function(exists) {
		//如果没有则返回404
		if (!exists) return send404(response);

		var stream = fs.createReadStream(absPath);

		stream.on(data, function() {

		});
	})

}


//当路径不存在时相应错误
function send404(response) {
	response.writeHeader(404, {"Content-Type": "text/plain;charset=UTF8"});
	response.writeHeader("Error: 404, 您访问的路径不存在!");
	response.end();
}


//相应文件
function sendFile(response, filePath, fileContents) {
	response.writeHeader(200, {"Content-Type", mime.lookup(fs.basename(filePath))});  //根据文件相应浏览器需要的content-type
	response.write(fileContents);
	response.end();
}


console.log("Server running at http://localhost:8000/");