/**
 * Adds CORS headers to the response
 *
 * ####Example:
 *
 *     app.all('/api*', capstone.middleware.cors);
 *
 * @param {app.request} req
 * @param {app.response} res
 * @param {function} next
 * @api public
 */

// The exported function returns a closure that retains
// a reference to the capstone instance, so it can be
// passed as middeware to the express app.

module.exports = function (capstone) {
	return function cors (req, res, next) {

		var origin = capstone.get('cors allow origin');
		if (origin) {
			res.header('Access-Control-Allow-Origin', origin === true ? '*' : origin);
		}

		if (capstone.get('cors allow methods') !== false) {
			res.header('Access-Control-Allow-Methods', capstone.get('cors allow methods') || 'GET,PUT,POST,DELETE,OPTIONS');
		}
		if (capstone.get('cors allow headers') !== false) {
			res.header('Access-Control-Allow-Headers', capstone.get('cors allow headers') || 'Content-Type, Authorization');
		}

		next();
	};
};
