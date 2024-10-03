var bodyParser = require('body-parser');

var uploads = require('../lib/uploads');

module.exports = function bindBodyParser (capstone, app) {
	// Set up body options and cookie parser
	var bodyParserParams = {};
	if (capstone.get('file limit')) {
		bodyParserParams.limit = capstone.get('file limit');
	}
	app.use(bodyParser.json(bodyParserParams));
	bodyParserParams.extended = true;
	app.use(bodyParser.urlencoded(bodyParserParams));
	if (capstone.get('handle uploads')) {
		uploads.configure(app, capstone.get('multer options'));
	}
};
