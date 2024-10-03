var express = require('express');

module.exports = function bindStaticMiddleware (capstone, app) {
	// the static option can be a single path, or array of paths
	// when set, we configure the express static middleware

	var staticPaths = capstone.get('static');
	var staticOptions = capstone.get('static options');

	if (typeof staticPaths === 'string') {
		staticPaths = [staticPaths];
	}

	if (Array.isArray(staticPaths)) {
		staticPaths.forEach(function (value) {
			app.use(express.static(capstone.expandPath(value), staticOptions));
		});
	}
};
