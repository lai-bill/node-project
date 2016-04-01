var exec = require('child_process').exec;
var tasks = [];
var count = 0;

function downloadNodeVersion(version, destination, callback) {
	var url = "http://nodejs.org/dist/node-v" + version + ".tar.gz";
	var filepath = destination + "/" + version + ".tgz";
	exec('curl ' + url + ' > ' + filepath, callback);	//创建一个进程并执行命令成功后执行回调函数
}


tasks.push(function(callback) {
	console.log("正在下载 Node v0.4.6……")
	downloadNodeVersion('0.4.6', 'temp', callback);
}, function(callback) {
	console.log("正在下载 Node v0.4.7……")
	downloadNodeVersion('0.4.7', 'temp', callback);
});


for (var index in tasks) {
	tasks[index](function(err) {
		console.log(err);
		if (++count !== tasks.length) return;
		console.log('All done!');
	});
}