var express = require('express');
var xlsx = require('node-xlsx');
var fs = require('fs');

var app = express();

app.get('/importExcel', function (req, res) {
	res.send('Hello World!');
	var filename='./public/test.xlsx';
	console.error(filename);
	var obj = xlsx.parse(filename);
	console.log(JSON.stringify(obj));
 
	res.send('import successfully!');
});

app.get('/importExcel', function (req, res) {
	res.send('Hello World!');
	var filename='./public/test.xlsx';
	console.error(filename);
	var obj = xlsx.parse(filename);
	console.log(JSON.stringify(obj));
 
	res.send('import successfully!');
});

app.get('/exportExcel.xlsx', function(req, res, next) {
	var data = [
		[1,2,3],
		[true, false, null, 'sheetjs'],
		['foo','bar',new Date('2014-02-19T14:30Z'), '0.3'], 
		['baz', null, 'qux']
	];
	var buffer = xlsx.build([{name: "mySheetName", data: data}]);
	fs.writeFileSync('b.xlsx', buffer, 'binary');
	res.send(buffer);
});

var server = app.listen(3000);