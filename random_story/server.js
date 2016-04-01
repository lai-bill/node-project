var fs = require("fs");
var request = require("request");
var htmlparser = require("htmlparser");
var configFilename = "./rss_feeds.txt";

var handle = [
	function() {
		fs.exists(configFilename, function(exists) {
			if (!exists) next('文件不存在');
			next(null, configFilename);
		})
	}, function(filename) {
		fs.readFile(filename, function(err, feedList) {
			if (err) next(err);
			feedList = feedList.toString()
							   .replace(/^\s+|\s+&/g, '')
							   .split("\n");
			
			next(null, feedList[Math.floor(Math.random() * feedList.length)]);
		});
	}, function(url) {
		request({uri: url}, function(err, res, body) {
			if (err) return next(err);
			if (res.statusCode !== 200)  return next('当前连接请求错误!');

			var handler = new htmlparser.RssHandler();
			var parser = new htmlparser.Parser(handler);

			parser.parseComplete(body);

			if (!handler.dom.items.length) return next('没有 RSS 条目');

			var item = handler.dom.items.shift();

			console.log(item.title);
			console.log(item.link);
		});
	}
];

function next(err) {
	if (err) return console.log(err);

	var params = [].slice.call(arguments, 1);
	var currentTask = handle.shift();
	if (currentTask) currentTask.apply(this, params);
}

next();