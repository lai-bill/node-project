console.log(require('connect').session);

var app = require('connect')()
	.use(require('cookie-parser')('keyboard cat'))
	.use(require('session')())
	.use(function(req, res) {
		if (req.session.views) {
			res.setHeader('Content-Type', 'text/html');
			res.end('<p>views:' + req.session.views + "</p>");
			req.session.views++;
		} else {
			req.session.views = 1;
			res.end('welcome to the session demo. refresh!');
		}
	})