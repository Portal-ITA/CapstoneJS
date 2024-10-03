/**
 * Configures and starts express server in SSL.
 *
 * Events are fired during initialisation to allow customisation, including:
 *   - onHttpsServerCreated
 *
 * consumed by lib/core/start.js
 *
 * @api private
 */

var https;
try {
	// Use spdy if available
	https = require('spdy');
} catch (e) {
	https = require('https');
}
var tls = require('tls');
var fs = require('fs');

module.exports = function (capstone, app, created, callback) {

	var ssl = capstone.get('ssl');
	var host = capstone.get('ssl host') || capstone.get('host');
	var port = capstone.get('ssl port');
	var message = (ssl === 'only') ? capstone.get('name') + ' (SSL) is ready on ' : 'SSL Server is ready on ';
	var sniFunc;

	var options = capstone.get('https server options') || {};
	if (options.NPNProtocols && options.NPNProtocols.length === 1 && options.NPNProtocols[0] === 'http/1.1') {
		// Remove default value so spdy can use its own better ones
		delete options.NPNProtocols;
	}

	if (capstone.get('ssl cert') && fs.existsSync(capstone.getPath('ssl cert'))) {
		options.cert = fs.readFileSync(capstone.getPath('ssl cert'));
	}
	if (capstone.get('ssl key') && fs.existsSync(capstone.getPath('ssl key'))) {
		options.key = fs.readFileSync(capstone.getPath('ssl key'));
	}
	if (capstone.get('ssl ca') && fs.existsSync(capstone.getPath('ssl ca'))) {
		options.ca = fs.readFileSync(capstone.getPath('ssl ca'));
	}
	if (capstone.get('ssl pfx') && fs.existsSync(capstone.getPath('ssl pfx'))) {
		options.pfx = fs.readFileSync(capstone.getPath('ssl pfx'));
	}
	if (capstone.get('ssl cert data')) {
		options.cert = capstone.get('ssl cert');
	}
	if (capstone.get('ssl key data')) {
		options.key = capstone.get('ssl key');
	}
	if (capstone.get('ssl ca data')) {
		options.ca = capstone.get('ssl ca');
	}
	if (capstone.get('ssl pfx data')) {
		options.pfx = capstone.get('ssl pfx');
	}
	if (capstone.get('ssl passphrase')) {
		options.passphrase = capstone.get('ssl passphrase');
	}
	sniFunc = capstone.get('ssl sni');
	if (sniFunc) {
		options.SNICallback = function (host, cb) {
			var ctx = sniFunc(host);
			cb(null, ctx && tls.createSecureContext(ctx));
		};
	}

	if ((!options.key || !options.cert) && !options.pfx && !capstone.get('letsencrypt')) {
		if (sniFunc) {
			// We populate the config with what sniFunc returns for localhost
			var localCtx = sniFunc('localhost');
			if (localCtx) {
				for (var prop in localCtx) {
					if (localCtx.hasOwnProperty(prop)) {
						options[prop] = localCtx[prop];
					}
				}
			}
		}
		if ((!options.key || !options.cert) && !options.pfx) {
			if (ssl === 'only') {
				console.log(capstone.get('name') + ' failed to start: invalid ssl configuration (certificate files required)');
				process.exit();
			}
			return callback(null, 'SSL Not Started: Invalid SSL Configuration (certificate files required)');
		}
	}

	var server = https.createServer(options, app);
	created();

	function ready (err) {
		callback(err, message);
	}

	message += 'https://' + host + ':' + port;
	capstone.httpsServer = server.listen(port, host, ready);
};
