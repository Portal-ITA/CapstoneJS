var assign = require('object-assign');

module.exports = function initViewLocals (capstone, app) {
	// Apply locals
	if (typeof capstone.get('locals') === 'object') {
		assign(app.locals, capstone.get('locals'));
	}

	// Default "pretty html" mode except in production
	// Only if it has not been specified in the locals setting
	if (app.locals.pretty === undefined && capstone.get('env') !== 'production') {
		app.locals.pretty = true;
	}
};
