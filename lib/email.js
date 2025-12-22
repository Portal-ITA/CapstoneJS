var capstone = require('../index');
var utils = require('keystone-utils');
var safeRequire = require('./safeRequire');

/**
 * Email Class
 * ===========
 *
 * Helper class for sending emails.
 *
 * New instances take a `templatePath` string which must be a folder in the
 * emails path, and must contain either `templateName/email.templateExt` or
 * `templateName.templateExt` which is used as the template for the HTML part
 * of the email.
 *
 * Once created, emails can be rendered or sent.
 *
 * Requires the `emails` path option.
 *
 * @api public
 */

var Email = function (options) {
	if (typeof options === 'string') {
		options = { templateName: options };
	}
	if (!utils.isObject(options)) {
		throw new Error('The capstone.Email class requires a templateName or options argument to be provided');
	}

	/**
	 * Capstone < 0.4 Compatibility
	 *
	 * NOTE: Add warnings and enable them in 4.1 or 4.2 release. These patterns
	 * will be deprecated with the 0.5 release!
	 */
	// keystome.set('email transport', 'sometransport') -> options.transport
	var emailTransport = capstone.get('email transport');
	if (!options.transport && emailTransport) {
		options.transport = emailTransport;
	}
	// templateExt -> engine
	if (!options.engine) {
		options.engine = options.templateExt;
	}
	// capstone.set('view engine', 'something') -> engine
	if (!options.engine) {
		var customEngine = capstone.get('custom engine');
		var viewEngine = capstone.get('view engine');
		if (typeof customEngine === 'function') {
			// when customEngine is a function, viewEngine is probably the extension
			options.engine = customEngine;
			options.ext = options.ext || options.templateExt || viewEngine;
		} else if (viewEngine) {
			// otherwise, default the email engine to capstone's view engine
			options.engine = viewEngine;
		}
	}
	// capstone.set('emails', 'rootpath') -> root
	var rootPath = capstone.get('emails');
	if (rootPath && !options.root) {
		options.root = rootPath;
	}

	// Try to use the keystone-email package and throw if it hasn't been installed
	// Can't use our global safeRequire here or none of the tests run
	var CapstoneEmail = safeRequire('keystone-email', 'email');

	// Create the new email instance with the template name and options
	var templateName = options.templateName;
	delete options.templateName;
	var email = new CapstoneEmail(templateName, options);

	// Make email.send backwards compatible with old argument signature
	var send = email.send;
	email.send = function () {
		var args = [arguments[0]];
		if (typeof arguments[1] === 'function') {
			// map .send(options, callback) => .send(locals, options, callback)
			// TOOD: Deprecate this call signature
			args.push(arguments[0]);
			args.push(arguments[1]);
		} else {
			// map .send(locals options, callback) => .send(locals, options, callback)
			args.push(arguments[1]);
			args.push(arguments[2]);
		}
		send.apply(email, args);
	};

	return email;
};

module.exports = Email;
