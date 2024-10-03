module.exports = function bindSassMiddleware (capstone, app) {
	// the sass option can be a single path, or array of paths
	// when set, we configure the node-sass middleware

	var sassPaths = capstone.get('sass');
	var sassOptions = capstone.get('sass options') || {};
	var debug = require('debug')('capstone:core:bindSassMiddleware');
	var _ = require('lodash');
	var safeRequire = require('../lib/safeRequire');

	if (typeof sassPaths === 'string') {
		sassPaths = [sassPaths];
	}

	if (Array.isArray(sassPaths)) {
		debug('adding sass');
		var sassMiddleware = safeRequire('node-sass-middleware', 'sass');

		var outputStyle = capstone.get('env') === 'production' ? 'compressed' : 'nested';
		sassPaths.forEach(function (path) {
			app.use(sassMiddleware(_.extend({
				src: capstone.expandPath(path),
				dest: capstone.expandPath(path),
				outputStyle: outputStyle,
			}, sassOptions)));
		});
	}
};
