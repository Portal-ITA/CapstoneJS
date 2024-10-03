module.exports = function (req, res) {

	var capstone = req.capstone;
	if (!capstone.security.csrf.validate(req)) {
		return res.apiError(403, 'invalid csrf');
	}

    try {
        var item = new req.list.model();
        capstone.accessGranted(req, (err) => {
            if (err) return res.status(401).json({ error: err.error, detail: err.detail });
            item.setLanguage(capstone.session.getLanguage(req));
            req.list.updateItem(item, req.body, { files: req.files, ignoreNoEdit: true, user: req.user, }, function (err) {
                if (err) {
                    var status = err.error === 'validation errors' ? 400 : 500;
                    var error = err.error === 'database error' ? err.detail : err;
                    return res.apiError(status, error);
                }
                res.json(req.list.getData(item));
            }); 
        });   
    }
    catch(e) {
        var reason = `Error verifying access to '${req.list.path}'`
        return res.status(500).json({ error: e.message, detail: reason });
    }

};