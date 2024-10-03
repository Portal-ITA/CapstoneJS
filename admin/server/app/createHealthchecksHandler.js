var safeRequire = require('../../../lib/safeRequire');

function createHealthchecksHandler (capstone) {
	var healthcheck = safeRequire('capstone-healthchecks', 'healthchecks');
	var healthcheckConfig = capstone.get('healthchecks');

	if (healthcheckConfig === true) {
		healthcheckConfig = {};
		// By default, we simply bind the user model healthcheck if there is a
		// user model. This validates we can successfully query the database.
		if (capstone.get('user model')) {
			var User = capstone.list(capstone.get('user model'));
			healthcheckConfig.canQueryUsers = healthcheck.healthchecks.canQueryListFactory(User);
		}
	}

	return healthcheck.createRoute(healthcheckConfig);
}

module.exports = createHealthchecksHandler;
