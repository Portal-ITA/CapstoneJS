var _ = require('lodash');
var express = require('express');
var grappling = require('grappling-hook');
var path = require('path');
var utils = require('keystone-utils');
var importer = require('./lib/core/importer');

/**
 * Don't use process.cwd() as it breaks module encapsulation
 * Instead, let's use module.parent if it's present, or the module itself if there is no parent (probably testing capstone directly if that's the case)
 * This way, the consuming app/module can be an embedded node_module and path resolutions will still work
 * (process.cwd() breaks module encapsulation if the consuming app/module is itself a node_module)
 */
var moduleRoot = (function (_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); // get rid of /node_modules from the end of the path
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);


/**
 * Capstone Class
 */
var Capstone = function () {
	grappling.mixin(this).allowHooks('pre:static', 'pre:bodyparser', 'pre:session', 'pre:logger', 'pre:admin', 'pre:adminroutes', 'pre:routes', 'pre:render', 'updates', 'signin', 'signout');
	this.lists = {};
	this.fieldTypes = {};
	this.paths = {};
	this._options = {
		'name': 'Capstone',
		'brand': 'Capstone',
		'admin path': 'capstone',
		'compress': true,
		'headless': false,
		'logger': ':method :url :status :response-time ms',
		'auto update': false,
		'model prefix': null,
		'module root': moduleRoot,
		'frame guard': 'sameorigin',
		'cache admin bundles': true,
		'handle uploads': true,
	};
	this._redirects = {};

	// expose express
	this.express = express;

	// init environment defaults
	this.set('env', process.env.NODE_ENV || 'development');

	this.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || '3000');
	this.set('host', process.env.HOST || process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
	this.set('listen', process.env.LISTEN);

	this.set('ssl', process.env.SSL);
	this.set('ssl port', process.env.SSL_PORT || '3001');
	this.set('ssl host', process.env.SSL_HOST || process.env.SSL_IP);
	this.set('ssl key', process.env.SSL_KEY);
	this.set('ssl cert', process.env.SSL_CERT);

	this.set('cookie secret', process.env.COOKIE_SECRET);
	this.set('cookie signin', (this.get('env') === 'development') ? true : false);

	this.set('embedly api key', process.env.EMBEDLY_API_KEY || process.env.EMBEDLY_APIKEY);
	this.set('mandrill api key', process.env.MANDRILL_API_KEY || process.env.MANDRILL_APIKEY);
	this.set('mandrill username', process.env.MANDRILL_USERNAME);
	this.set('google api key', process.env.GOOGLE_BROWSER_KEY);
	this.set('google server api key', process.env.GOOGLE_SERVER_KEY);
	this.set('ga property', process.env.GA_PROPERTY);
	this.set('ga domain', process.env.GA_DOMAIN);
	this.set('chartbeat property', process.env.CHARTBEAT_PROPERTY);
	this.set('chartbeat domain', process.env.CHARTBEAT_DOMAIN);
	this.set('allowed ip ranges', process.env.ALLOWED_IP_RANGES);

	if (process.env.S3_BUCKET && process.env.S3_KEY && process.env.S3_SECRET) {
		this.set('s3 config', { bucket: process.env.S3_BUCKET, key: process.env.S3_KEY, secret: process.env.S3_SECRET, region: process.env.S3_REGION });
	}

	if (process.env.AZURE_STORAGE_ACCOUNT && process.env.AZURE_STORAGE_ACCESS_KEY) {
		this.set('azurefile config', { account: process.env.AZURE_STORAGE_ACCOUNT, key: process.env.AZURE_STORAGE_ACCESS_KEY });
	}

	if (process.env.CLOUDINARY_URL) {
		// process.env.CLOUDINARY_URL is processed by the cloudinary package when this is set
		this.set('cloudinary config', true);
	}

	// init mongoose
	this.set('mongoose', require('mongoose'));
	this.mongoose.Promise = require('es6-promise').Promise;

	// Attach middleware packages, bound to this instance
	this.middleware = {
		api: require('./lib/middleware/api')(this),
		cors: require('./lib/middleware/cors')(this),
	};
};

_.extend(Capstone.prototype, require('./lib/core/options'));

_.extend(Capstone.prototype, require('./lib/core/accessControl'));

Capstone.prototype.prefixModel = function (key) {
	var modelPrefix = this.get('model prefix');

	if (modelPrefix) {
		key = modelPrefix + '_' + key;
	}

	return require('mongoose/lib/utils').toCollectionName(key);
};

/* Attach core functionality to Capstone.prototype */
Capstone.prototype.createItems = require('./lib/core/createItems');
Capstone.prototype.createRouter = require('./lib/core/createRouter');
Capstone.prototype.getOrphanedLists = require('./lib/core/getOrphanedLists');
Capstone.prototype.importer = importer;
Capstone.prototype.init = require('./lib/core/init');
Capstone.prototype.initDatabaseConfig = require('./lib/core/initDatabaseConfig');
Capstone.prototype.initExpressApp = require('./lib/core/initExpressApp');
Capstone.prototype.initExpressSession = require('./lib/core/initExpressSession');
Capstone.prototype.initNav = require('./lib/core/initNav');
Capstone.prototype.list = require('./lib/core/list');
Capstone.prototype.openDatabaseConnection = require('./lib/core/openDatabaseConnection');
Capstone.prototype.closeDatabaseConnection = require('./lib/core/closeDatabaseConnection');
Capstone.prototype.populateRelated = require('./lib/core/populateRelated');
Capstone.prototype.redirect = require('./lib/core/redirect');
Capstone.prototype.start = require('./lib/core/start');
Capstone.prototype.wrapHTMLError = require('./lib/core/wrapHTMLError');
Capstone.prototype.createCapstoneHash = require('./lib/core/createCapstoneHash');

/* Deprecation / Change warnings for 0.4 */
Capstone.prototype.routes = function () {
	throw new Error('capstone.routes(fn) has been removed, use capstone.set(\'routes\', fn)');
};


/**
 * The exports object is an instance of Capstone.
 */
var capstone = module.exports = new Capstone();

/*
	Note: until #1777 is complete, the order of execution here with the requires
	(specifically, they happen _after_ the module.exports above) is really
	important. As soon as the circular dependencies are sorted out to get their
	capstone instance from a closure or reference on {this} we can move these
	bindings into the Capstone constructor.
*/

// Expose modules and Classes
capstone.Admin = {
	Server: require('./admin/server'),
};
capstone.Email = require('./lib/email');
capstone.Field = require('./fields/types/Type');
capstone.Field.Types = require('./lib/fieldTypes');
capstone.Capstone = Capstone;
capstone.List = require('./lib/list')(capstone);
capstone.Storage = require('./lib/storage');
capstone.View = require('./lib/view');

capstone.content = require('./lib/content');
capstone.security = {
	csrf: require('./lib/security/csrf'),
};
capstone.utils = utils;

/**
 * returns all .js modules (recursively) in the path specified, relative
 * to the module root (where the capstone project is being consumed from).
 *
 * ####Example:
 *     var models = capstone.import('models');
 */

Capstone.prototype.import = function (dirname) {
	return importer(this.get('module root'))(dirname);
};


/**
 * Applies Application updates
 */

Capstone.prototype.applyUpdates = function (callback) {
	var self = this;
	self.callHook('pre:updates', function (err) {
		if (err) return callback(err);
		require('./lib/updates').apply(function (err) {
			if (err) return callback(err);
			self.callHook('post:updates', callback);
		});
	});
};


/**
 * Logs a configuration error to the console
 */

Capstone.prototype.console = {};
Capstone.prototype.console.err = function (type, msg) {
	if (capstone.get('logger')) {
		var dashes = '\n------------------------------------------------\n';
		console.log(dashes + 'CapstoneJS: ' + type + ':\n\n' + msg + dashes);
	}
};

/**
 * Capstone version
 */

capstone.version = require('./package.json').version;


// Expose Modules
capstone.session = require('./lib/session');
