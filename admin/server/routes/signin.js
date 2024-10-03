var ejs = require('ejs');
var path = require('path');

var templatePath = path.resolve(__dirname, '../templates/signin.html');

module.exports = function SigninRoute (req, res) {
	var capstone = req.capstone;
	var UserList = capstone.list(capstone.get('user model'));
	var locals = {
		adminPath: '/' + capstone.get('admin path'),
		brand: capstone.get('brand'),
		csrf: { header: {} },
		logo: capstone.get('signin logo'),
		redirect: capstone.get('signin redirect'),
		user: req.user ? {
			id: req.user.id,
			name: UserList.getDocumentName(req.user) || '(no name)',
		} : undefined,
		usercanAccessCapstone: !!(req.user && req.user.canAccessCapstone),
	};
	locals.csrf.header[capstone.security.csrf.CSRF_HEADER_KEY] = capstone.security.csrf.getToken(req, res);
	ejs.renderFile(templatePath, locals, { delimiter: '%' }, function (err, str) {
		if (err) {
			console.error('Could not render Admin UI Signin Template:', err);
			return res.status(500).send(capstone.wrapHTMLError('Error Rendering Signin', err.message));
		}
		res.send(str);
	});
};
