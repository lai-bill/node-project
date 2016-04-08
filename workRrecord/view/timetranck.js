var qs = require('querystring');

exports.sendHtml = function(res, html) {
	res.setHeader('Content-Type', 'text/html;charset=UTF8');
	res.setHeader('Content-Length', Buffer.byteLength(html));
	res.end(html);
}

exports.parseReceuvedData = function(req, cb) {
	var body = '';
	req.setEncoding('UTF8');

	req.on('data', function(chunk) {
		body += chunk;
	});

	req.on('end', function() {
		cb(qs.parse(body))
	});
}

exports.actionForm = function(id, path, label) {
	return 
		'<form method="POST" action="' + path + '">\
			<input type="hidden" name="id" value="' + id +'">\
			<input type="submit" value="' + label + '">\
		</form>';
}

exports.add = function(db, req, res) {
	exports.parseReceuvedData(req, function(work) {
		db.query(
			'INSERT INTO work (hours, date, description) VALUE (?, ?, ?)',
			[work.hours, work.date, work.description],
			function(err) {
				if (err) throw err;
				exports.show(db, res);
			}
		);
	});
}

exports.delete = function(db, req, res) {
	exports.parseReceuvedData(req, function(work) {
		db.query(
			'DELETE FROM work WHERE id=?',
			[work.id],
			function(err) {
				if (err) throw err;
				exports.show(db, res);
			}
		);
	})
}

exports.archive = function(db, req, res) {
	exports.parseReceuvedData(req, function(work) {
		db.query(
			'UPDATE work SET archived=1 WHERE id=?',
			[work.id],
			function(err) {
				if (err) throw err;
				exports.show(db, res);
			}
		);
	});
}

exports.show = function(db, res, showArchived) {
	var arcguveValue = showArchived ? 1 : 0;
	db.query(
		'SELECT * FROM work WHERE archived=? ORDER BY date DESC',
		[arcguveValue],
		function(err, rows) {
			console.log(rows);
			if (err) throw err;
			var html = showArchived ? 
				'' :
				'<a href="/archived">Archived Work</a><br/>';
			html += exports.workHitlistHtml(rows);
			html += exports.workFormHtml();
			exports.sendHtml(res, html);
		}
	);
}

exports.showArchived = function(db, res) {
	exports.show(db, res, true);
}

exports.workHitlistHtml = function(row) {
	var html = 
	'<table>' + row.map(function(item) {
		var archive = item.archived ? '<td>'+exports.workArchiveForm(item.id)+'</td>' : "";
		var itemHtml = 
			'<tr>\
				<td>' + item.date + '</td>\
				<td>' + item.hours + '</td>\
				<td>' + item.description + '</td>' + archive + '\
			</tr>';
		return itemHtml
	}).join("") + '</table>';

	return html;
}

exports.workFormHtml = function() {
	 var html = 
		'<form method="POST" action="/">\
			<p>Date (YYYY-MM-DD): <br/><input name="date" type="text"></p>\
			<p>Hours worked: <br/><input name="hours" type="text"></p>\
			<p>description: <textarea name="description"></textarea></p>\
			<input value="Add" type="submit"></p>\
		<form>';
	return html;
}