/**
 * Configures and starts express server.
 *
 * Events are fired during initialisation to allow customisation, including:
 *   - onHttpServerCreated
 *
 * consumed by lib/core/start.js
 *
 * @api private
 */

var http = require('http');

module.exports = function (capstone, app, callback) {

	var host = capstone.get('host');
	var port = capstone.get('port');
	var forceSsl = (capstone.get('ssl') === 'force');

	capstone.httpServer = http
		.createServer(app)
		.listen(port, host, function ready (err) {
			if (err) { return callback(err); }

			var message = capstone.get('name') + ' is ready on '
				+ 'http://' + host + ':' + port
				+ (forceSsl ? ' (SSL redirect)' : '');
			callback(null, message);
		});

};
