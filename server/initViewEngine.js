module.exports = function initViewEngine (capstone, app) {
	// Allow usage of custom view engines
	if (capstone.get('custom engine')) {
		app.engine(capstone.get('view engine'), capstone.get('custom engine'));
	}

	// Set location of view templates and view engine
	app.set('views', capstone.getPath('views') || 'views');
	app.set('view engine', capstone.get('view engine'));

	var customView = capstone.get('view');
	if (customView) {
		app.set('view', customView);
	}
};
