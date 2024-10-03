/**
 * Adds iframe protection headers to the response
 *
 * ####Example:
 *
 *     app.use(capstone.security.frameGuard(capstone));
 *
 * @param {app.request} req
 * @param {app.response} res
 * @param {function} next
 * @api public
 */

module.exports = function (capstone) {
	return function frameGuard (req, res, next) {
		var options = capstone.get('frame guard');
		if (options) {
			res.header('x-frame-options', options);
		}
		next();
	};
};
