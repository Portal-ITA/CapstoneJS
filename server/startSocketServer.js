/**
 * Configures and starts express server.
 *
 * Events are fired during initialisation to allow customisation, including:
 *   - onSocketServerCreated
 *
 * consumed by lib/core/start.js
 *
 * @api private
 */

var fs = require('fs');

module.exports = function (capstone, app, callback) {

	var unixSocket = capstone.get('unix socket');
	var message = capstone.get('name') + ' is ready on ' + unixSocket;

	fs.unlink(unixSocket, function () {
		// we expect err if the file is new so don't capture the argument
		capstone.httpServer = app.listen(unixSocket, function (err) {
			callback(err, message);
		});
		fs.chmod(unixSocket, 0x777);
	});

};
