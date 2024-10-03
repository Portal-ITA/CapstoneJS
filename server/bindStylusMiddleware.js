module.exports = function bindStylusMiddleware (capstone, app) {
	// the stylus option can be a single path, or array of paths
	// when set, we configure the stylus middleware
	var stylusPaths = capstone.get('stylus');
	var stylusOptions = capstone.get('stylus options') || {};
	var debug = require('debug')('capstone:core:bindStylusMiddleware');
	var _ = require('lodash');
	var safeRequire = require('../lib/safeRequire');

	if (typeof stylusPaths === 'string') {
		stylusPaths = [stylusPaths];
	}

	if (Array.isArray(stylusPaths)) {
		debug('adding stylus');
		var stylusMiddleware = safeRequire('stylus', 'stylus').middleware;

		stylusPaths.forEach(function (path) {
			app.use(stylusMiddleware(_.extend({
				src: capstone.expandPath(path),
				dest: capstone.expandPath(path),
				compress: capstone.get('env') === 'production',
			}, stylusOptions)));
		});
	}
};
