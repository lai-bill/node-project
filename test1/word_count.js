var fs = require("fs");
var fileDir = "./word/";



fs.readdir(fileDir, function(err, file) {
	if (err) throw err;
	var tasks = [];
	var wordCounts = {};
	var completedTasks = 0;

	for (var key in file) {
		tasks.push((function(filename) {
			return function() {
				fs.readFile(fileDir + filename, function(err, text) {
					if (err) throw err;
					text = (new Buffer(text, "binary")).toString("UTF8").toLowerCase();
					text = text.split(/\W+/).sort();

					for (var key in text) {
						wordCounts[text[key]] = wordCounts[text[key]] ? wordCounts[text[key]] + 1 : 1 
					}

					if (++completedTasks !== tasks.length) return;

					for (var key in wordCounts) {
						console.log(key + ":" + wordCounts[key]);
					}
				});
			}
		})(file[key]));
	}

	for (var key in tasks) {
		tasks[key]();
	}
})