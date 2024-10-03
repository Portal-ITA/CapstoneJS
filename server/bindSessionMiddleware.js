module.exports = function bindSessionMiddleware (capstone, app) {

	app.use(capstone.get('session options').cookieParser);

	// pre:session hooks
	if (typeof capstone.get('pre:session') === 'function') {
		capstone.get('pre:session')(app);
	}
	app.use(function (req, res, next) {
		capstone.callHook('pre:session', req, res, next);
	});

	app.use(capstone.expressSession);
	app.use(require('connect-flash')());

	if (capstone.get('session') === true) {
		app.use(capstone.session.persist);
	} else if (typeof capstone.get('session') === 'function') {
		app.use(capstone.get('session'));
	}

};
