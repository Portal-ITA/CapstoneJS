module.exports = function bindErrorHandlers (capstone, app) {
	if (Object.keys(capstone._redirects).length) {
		app.use(function (req, res, next) {
			if (capstone._redirects[req.path]) {
				res.redirect(capstone._redirects[req.path]);
			} else {
				next();
			}
		});
	}
};
