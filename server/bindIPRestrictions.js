var debug = require('debug')('capstone:server:bindIpRestrictions');

module.exports = function bindIPRestrictions (capstone, app) {
	// Check for IP range restrictions
	if (capstone.get('allowed ip ranges')) {
		if (!app.get('trust proxy')) {
			console.log(
				'CapstoneJS Initialisaton Error:\n\n'
				+ 'to set IP range restrictions the "trust proxy" setting must be enabled.\n\n'
			);
			process.exit(1);
		}
		debug('adding IP ranges', capstone.get('allowed ip ranges'));
		app.use(require('../lib/security/ipRangeRestrict')(
			capstone.get('allowed ip ranges'),
			capstone.wrapHTMLError
		));
	}
};
