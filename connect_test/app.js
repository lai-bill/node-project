var app = require('connect')()
	.use(function(req, res, next) {
		foo();
		req.setHeader('Content-Type', 'text/plain');
		req.end('hello world');
	})
	.use(logger(":method :url"))
	.use(route(require('./routes')))
	.use(hello)
	.use(errorHandler())
	.listen(8080);


//配置请求打印信息
function logger(format) {
	var logfields = format.replace(/:(\w+)/g, function(match, property) {
		if (!property) return "";
		return property + " , ";
	}).split(" , ");

	logfields.pop();

	logfields = logfields.map(function(item){
		if (!item.trim()) return;
		return item.trim();
	});

	return function(req, res, next) {
		var logs = logfields.map(function(item) {
			return item + " is " + req[item];
		}).join('\n');
		console.log(logs);
		next();
	}
}


//路由
function route(obj) {
	var parse = require('url').parse;
	var regs = {};

	return function(req, res, next) {
		var routes = obj[req.method];
		if (!routes) return next();
		var url = parse(req.url).pathname;
		var paths = Object.keys(routes);

		for(var i = 0; i < paths.length; i++) {
			if (!regs[paths[i]]) {
				var path = paths[i].replace(/\//g, '\\/').replace(/:(\w+)/g, '([^\\/]+)');
				regs[paths[i]] = new RegExp('^' + path + '$');
			}

			var fn = routes[paths[i]];
			var re = regs[paths[i]];
			var captures = url.match(re);
			var keys = paths[i].match(re);
			if (captures && keys) {
				var params = {};
				for (var i = 1; i < keys.length; i++) {
					params[keys[i].substr(1)] = captures[i];
				}
				var args = [req, res, params];
		-		fn.apply(null, args);
				return;
			}
		}
		next();
	}
}


function errorHandler() {
	var env = process.env.NODE_ENV || 'development';

	return function(err, req, res, next) {
		if (env === 'development') {
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(err));
		} else {
			res.end('Server error');
		}
	}
}


function restrict(req, res, next) {
	var authorization = req.headers.authorization;
	if (!authorization) return next(new Error('Unauthorized'));

	var parts = authorization.split(' ');
	var scheme = parts[0];
	var auth = new Buffer(parts[1], 'base64').toString().split(":");
	var user = auth[0];
	var pass = auth[1];

	console.log(user);
	console.log(pass);
	next();
}


function admin(req, res, next) {
	switch(req.url) {
		case '/':
			res.end('try / users');
			break;
		case '/users':
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(['tobi', 'loki', 'jane']));
			break;
	}
} 


function hello(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello world');
}