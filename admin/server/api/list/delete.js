var async = require('async');

module.exports = function (req, res) {

	var capstone = req.capstone;
	if (!capstone.security.csrf.validate(req)) {
		console.log('Refusing to delete ' + req.list.key + ' items; CSRF failure');
		return res.apiError(403, 'invalid csrf');
	}
	if (req.list.get('nodelete')) {
		console.log('Refusing to delete ' + req.list.key + ' items; List.nodelete is true');
		return res.apiError(400, 'nodelete');
	}
	var ids = req.body.ids || req.body.id || req.params.id;
	if (typeof ids === 'string') {
		ids = ids.split(',');
	}
	if (!Array.isArray(ids)) {
		ids = [ids];
	}

	if (req.user) {
		var checkResourceId = (capstone.get('user model') === req.list.key);

		var userId = String(req.user.id);
		// check if user can delete this resources based on resources ids and userId
		if (checkResourceId && ids.some(function (id) {
			return id === userId;
		})) {
			console.log('Refusing to delete ' + req.list.key + ' items; ids contains current User id');
			return res.apiError(403, 'You can not delete yourself', 'not allowed');
		}
	}
	var deletedCount = 0;
	var deletedIds = [];
    try {
        capstone.accessGrantedList('deleteAny', req, (err, results) => {
            if (err) return res.status(401).json({ error: err.error, detail: err.detail });
            if (!results) return res.status(404).json({ error: 'database error', detail: err.message });
                async.forEachLimit(results, 10, function (item, next) {
                    item._req_user = req.user;
                    item.remove(function (err) {
                        if (err) return next(err);
                        deletedCount++;
                        deletedIds.push(item.id);
                        next();
                    });
                }, (err) => {
                    if (err) 
                        res.status(500).json({ error: 'database error', detail: err.message });
                    else 
                        return res.json({
                            success: true,
                            ids: deletedIds,
                            count: deletedCount,
                        });
                });
        });
    }
    catch(e) {
        var reason = `Error verifying access to '${req.list.path}'`
        return res.status(500).json({ error: e.message, detail: reason });
    }

};