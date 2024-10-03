module.exports = function initList (req, res, next) {
	var capstone = req.capstone;
	req.list = capstone.list(req.params.list);
	if (!req.list) {
		if (req.headers.accept === 'application/json') {
			return res.status(404).json({ error: 'invalid list path' });
		}
		req.flash('error', 'List ' + req.params.list + ' could not be found.');
		return res.redirect('/' + capstone.get('admin path'));
	}
	next();
};
