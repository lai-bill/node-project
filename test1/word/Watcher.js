var fs = require("fs");
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var http = require("http");
var iconv = require("iconv-lite");


function Watcher(watchDir, processedDir) {
	this.watchDir = watchDir;
	this.processedDir = processedDir;
}

EventEmitter.call(Watcher);
util.inherits(Watcher, EventEmitter);


Watcher.prototype.watch = function() {
	var that = this;
	fs.watch(that.watchDir, function(event, filename) {
		filename = iconv.decode(new Buffer(filename, "binary"), "UTF8");
		that.emit(event, filename);
	});
}

Watcher.prototype.start = function() {
	var that = this;
	that.watch();
	that.on('rename', function(fileName) {

		var readFile = that.watchDir + "/" + fileName;
		var writeFile = that.processedDir + "/" + fileName;
		var readExists = '';
		var writeExists = '';

		fs.exists(readFile, function(exists) {
			rename(readExists = exists);
		});

		fs.exists(writeFile, function(exists) {
			rename(writeExists = exists);
		})

		function rename() {
			if (typeof readExists === 'string' || typeof writeExists === 'string') return;
			if ((readExists && writeExists) || (!readExists && !writeExists)) return;

			if (writeExists) {
				fs.unlink(writeFile, function(err) {
					if (err) that.on('error', new Error(err));
				});
				return;
			}

			var readStream = fs.createReadStream(readFile);
			var writeStream = fs.createWriteStream(writeFile, {flags: 'w+'});

			readStream.on('error', function(err) {
				that.emit('error', new Error(err));
			});

			writeStream.on('error', function(err) {
				that.emit('error', new Error(err));
			});

			readStream.pipe(writeStream);

		}
	});

	that.on('change', function(filename) {
		var readFile = that.watchDir + "/" + filename;
		var writeFile = that.processedDir + "/" + filename;
		var readExists = '';
		var writeExists = '';

		fs.exists(readFile, function(exists) {
			change(readExists = exists);
		});

		fs.exists(writeFile, function(exists) {
			change(writeExists = exists);
		});

		function change() {
			if (typeof readExists === 'string' || typeof writeExists === 'string') return;
			if (!readExists) return;


			var readStream = fs.createReadStream(readFile);
			var writeStream = fs.createWriteStream(writeFile, {flags: 'w+'});

			readStream.on('error', function(err) {
				that.emit('error', new Error(err));
			});

			writeStream.on('error', function(err) {
				that.emit('error', new Error(err));
			});

			readStream.pipe(writeStream);
		}

	});
}


var watcher = new Watcher("./imgs", "./arc");
watcher.start();

var server = http.createServer(function(req, res) {
	
})

server.listen(8000);