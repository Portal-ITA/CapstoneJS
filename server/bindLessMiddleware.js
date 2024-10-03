module.exports = function bindLessMiddleware (capstone, app) {
	// the less option can be a single path, or array of paths
	// when set, we configure the less middleware
	var lessPaths = capstone.get('less');
	var lessOptions = capstone.get('less options') || {};

	if (typeof lessPaths === 'string') {
		lessPaths = [lessPaths];
	}

	if (Array.isArray(lessPaths)) {
		lessPaths.forEach(function (path) {
			app.use(require('less-middleware')(capstone.expandPath(path), lessOptions));
		});
	}
};
