module.exports = {
	'GET': {
		'/': function(req, res) {
			res.end("???");
		},
		'/user/:lai/bill/:user': function(req, res, lai) {
			console.log(lai);
			res.end('user');
		}
	}
}