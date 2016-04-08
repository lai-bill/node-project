var work = require('./view/timetranck.js');

var db = require('mysql').createConnection({
	host: '120.76.165.85',
	user: 'bill',
	password: 'Laizhibin_066',
	database: 'project_test'
});


var server = require('http').createServer(function(req, res) {
	
	switch (req.method) {
		case 'POST': 
			switch (req.url) {
				case '/': work.add(db, req, res); break;
				case '/archive': work.archive(db, req, res); break;
				case '/delete': work.delete(db, req, res); break;
			}
		break;
		case 'GET':
			case '/': work.show(db, res); break;
			case '/archived': work.showArchived(db, res); break;
		break;
	}

});



db.query(
	'CREATE TABLE IF NOT EXISTS work (\
		id INT(10) NOT NULL AUTO_INCREMENT, \
		hours DECIMAL(5,2) DEFAULT 0, \
		date DATE, \
		archived INT(1) DEFAULT 0,  \
		description LONGTEXT, \
		PRIMARY KEY(id)\
	)',
	function(err) {
		if (err) throw err;
		console.log('Server started……');
		server.listen(8080, '127.0.0.1');
	}
);