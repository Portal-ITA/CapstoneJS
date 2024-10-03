var session = require('../../../lib/session');

module.exports = function SignoutRoute (req, res) {
	var capstone = req.capstone;
	session.signout(req, res, function () {
		// After logging out, the user will be redirected to /signin?signedout
		// It shows a bar on top of the sign in panel saying "You have been signed out".
		if (typeof capstone.get('signout redirect') === 'string') {
			return res.redirect(capstone.get('signout redirect'));
		} else if (typeof capstone.get('signout redirect') === 'function') {
			return capstone.get('signout redirect')(req, res);
		} else {
			return res.redirect('/' + capstone.get('admin path') + '/signin?signedout');
		}
	});
};
