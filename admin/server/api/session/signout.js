function signout (req, res) {
	var capstone = req.capstone;
	if (!capstone.security.csrf.validate(req)) {
		return res.apiError(403, 'invalid csrf');
	}
	var user = req.user;
	capstone.callHook(user, 'pre:signout', function (err) {
		if (err) return res.status(500).json({ error: 'pre:signout error', detail: err });
		res.clearCookie('capstone.uid');
        req.user = null;
        req.profile = null;
		req.session.regenerate(function (err) {
			if (err) return res.status(500).json({ error: 'session error', detail: err });
			capstone.callHook(user, 'post:signout', function (err) {
				if (err) return res.status(500).json({ error: 'post:signout error', detail: err });
				res.json({ success: true });
			});
		});
	});
}

module.exports = signout;
