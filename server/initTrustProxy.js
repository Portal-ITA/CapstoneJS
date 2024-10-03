module.exports = function initTrustProxy (capstone, app) {
	// Process 'X-Forwarded-For' request header
	if (capstone.get('trust proxy') === true) {
		app.enable('trust proxy');
	} else {
		app.disable('trust proxy');
	}
};
