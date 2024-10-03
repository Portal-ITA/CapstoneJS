var compression = require('compression');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var morgan = require('morgan');

var language = require('../lib/middleware/language');

module.exports = function createApp (capstone, express) {

	if (!capstone.app) {
		if (!express) {
			express = require('express');
		}
		capstone.app = express();
	}

	var app = capstone.app;
	require('./initLetsEncrypt')(capstone, app);
	require('./initSslRedirect')(capstone, app);

	capstone.initDatabaseConfig();
	capstone.initExpressSession(capstone.mongoose);

	require('./initTrustProxy')(capstone, app);
	require('./initViewEngine')(capstone, app);
	require('./initViewLocals')(capstone, app);
	require('./bindIPRestrictions')(capstone, app);

	// Compress response bodies
	if (capstone.get('compress')) {
		app.use(compression());
	}

	// Pre static config
	if (typeof capstone.get('pre:static') === 'function') {
		capstone.get('pre:static')(app);
	}
	app.use(function (req, res, next) {
		capstone.callHook('pre:static', req, res, next);
	});

	// Serve static assets

	if (capstone.get('favicon')) {
		app.use(favicon(capstone.getPath('favicon')));
	}

	// unless the headless option is set (which disables the Admin UI),
	// bind the Admin UI's Static Router for public resources
	if (!capstone.get('headless')) {
		app.use('/' + capstone.get('admin path'), require('../admin/server').createStaticRouter(capstone));
	}

	require('./bindLessMiddleware')(capstone, app);
	require('./bindSassMiddleware')(capstone, app);
	require('./bindStylusMiddleware')(capstone, app);
	require('./bindStaticMiddleware')(capstone, app);
	require('./bindSessionMiddleware')(capstone, app);

	// Log dynamic requests
	app.use(function (req, res, next) {
		capstone.callHook('pre:logger', req, res, next);
	});
	// Bind default logger (morgan)
	if (capstone.get('logger')) {
		var loggerOptions = capstone.get('logger options');
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		if (loggerOptions && typeof loggerOptions.tokens === 'object') {
			for (var key in loggerOptions.tokens) {
				if (hasOwnProperty.call(loggerOptions.tokens, key) && typeof loggerOptions.tokens[key] === 'function') {
					morgan.token(key, loggerOptions.tokens[key]);
				}
			}
		}

		app.use(morgan(capstone.get('logger'), loggerOptions));
	}
	// Bind custom logging middleware
	if (capstone.get('logging middleware')) {
		app.use(capstone.get('logging middleware'));
	}

	// unless the headless option is set (which disables the Admin UI),
	// bind the Admin UI's Dynamic Router
	if (!capstone.get('headless')) {
		if (typeof capstone.get('pre:admin') === 'function') {
			capstone.get('pre:admin')(app);
		}
		app.use(function (req, res, next) {
			capstone.callHook('pre:admin', req, res, next);
		});
		app.use('/' + capstone.get('admin path'), require('../admin/server').createDynamicRouter(capstone));
	}

	// Pre bodyparser middleware
	if (typeof capstone.get('pre:bodyparser') === 'function') {
		capstone.get('pre:bodyparser')(app);
	}
	app.use(function (req, res, next) {
		capstone.callHook('pre:bodyparser', req, res, next);
	});

	require('./bindBodyParser')(capstone, app);
	app.use(methodOverride());

	// Set language preferences
	var languageOptions = capstone.get('language options') || {};
	if (!languageOptions.disable) {
		app.use(language(capstone));
	}

	// Add 'X-Frame-Options' to response header for ClickJacking protection
	if (capstone.get('frame guard')) {
		app.use(require('../lib/security/frameGuard')(capstone));
	}

	// Pre route config
	if (typeof capstone.get('pre:routes') === 'function') {
		capstone.get('pre:routes')(app);
	}
	app.use(function (req, res, next) {
		capstone.callHook('pre:routes', req, res, next);
	});

	// Configure application routes
	var appRouter = capstone.get('routes');
	if (typeof appRouter === 'function') {
		if (appRouter.length === 3) {
			// new:
			//    var myRouter = new express.Router();
			//    myRouter.get('/', (req, res) => res.send('hello world'));
			//    capstone.set('routes', myRouter);
			app.use(appRouter);
		} else {
			// old:
			//    var initRoutes = function (app) {
			//      app.get('/', (req, res) => res.send('hello world'));
			//    }
			//    capstone.set('routes', initRoutes);
			appRouter(app);
		}
	}


	require('./bindRedirectsHandler')(capstone, app);

	// Error config
	if (typeof capstone.get('pre:error') === 'function') {
		capstone.get('pre:error')(app);
	}
	app.use(function (req, res, next) {
		capstone.callHook('pre:error', req, res, next);
	});
	require('./bindErrorHandlers')(capstone, app);

	return app;

};
