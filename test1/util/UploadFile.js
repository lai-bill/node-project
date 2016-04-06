var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var size = 0;
var reqSize = 0;
function handleUpload(req) {
	var event = new EventEmitter();
	var body = {files: []};
	var boundaryStr = req.headers['content-type'].match(/boundary=([^"]+)/);
	if (!boundaryStr) return event;
	boundaryStr = boundaryStr[1];
	
	var boundary = new Buffer(boundaryStr.length + 2);
	boundary.write('--', 0);
	boundary.write(boundaryStr, 2);

	var slit = new Buffer('\r\n\r\n');
	var end = new Buffer('-')[0];
	var lastItem =  {};

	req.setEncoding('UTF8');
	req.on('data', function(chunk) {
		return writelog(chunk);
		parseFile(chunk, body);
		reqSize += Buffer.byteLength(chunk)
	});
	req.on('end', function() {
		event.emit('end', body);
	});

	function parseFile(handle, data) {
		var handles = [];
		(function splitHandle(handle) {
			var index = handle.indexOf(boundary);
			var keyValue = handle.indexOf(slit);
			console.log(index);
			if (index === -1 ){
				if (lastItem.name) {
					handles.push({
						header: 'name="'+lastItem.name+'" Content-Type: ' + lastItem.type+
								' filename="'+lastItem.filename+'"',
						value: handle, 
						oper: 'add'
					});
				}
				return undefined;
			}
			if (keyValue === -1) return index;
			if (handle[index + 1] === handle[index + 2] === end) return index;
			
			var header = handle.slice(index + boundary.length, keyValue);
			var last = splitHandle(handle.slice(keyValue + 4));
			if (last) {
				last = last + keyValue + 4 - 2;
			}
			 
			var value = handle.slice(keyValue + 4, last);

			handles.push({header: header, value: value});
			return index;
		})(handle)

		handles.forEach(function(handle) {

			var header = handle.header.toString();
			var val = handle.value;
			var name = header.match(/name=['|"](\w+)['|"]/i);
			var type = header.match(/Content-Type: ([\w\/]{1,})/i);
			var fileName = header.match(/filename=["|']([^\/\\]+)["|']/i);
			if (!name) return;
			name = name[1];

			if (handle.oper === 'add') {
				if (!name[1]) return;

				if (!(type[1] && fileName[1])) {
					data[name[1]] += val.toString();
				} else {
					event.emit('fileUploadData', lastItem);
				}
				return;
			}


			if (!(type && fileName)){
				if (lastItem.type && lastItem.filename) {
					event.emit('fileUploadEnd', lastItem);
					delete lastItem.type;
					delete lastItem.filename;
				}
				lastItem.name = name;
				lastItem.val = val.toString();
				return data[name] = val.toString();
			}

			type = type[1];
			fileName = fileName[1];
			console.log(type);
			lastItem.name = name;
			lastItem.type = type;
			lastItem.filename = fileName;
			event.emit('fileUploadStart', lastItem);
			lastItem.val = val;
			data.files.push({name: name, type: type, filename: fileName});
			size += Buffer.byteLength(val);
			event.emit('fileUploadData', lastItem);
		});
	}

	return event;
}

module.exports = handleUpload;


function writelog(str) {
	fs.appendFileSync('../log.txt' ,'--------------\n\n' + str);
}