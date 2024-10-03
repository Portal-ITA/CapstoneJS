var async = require('async');

module.exports = function (req, res) {
	var capstone = req.capstone;
	var counts = {};
	async.each(capstone.lists, function (list, next) {
		list.model.count(function (err, count) {
			counts[list.key] = count;
			next(err);
		});
	}, function (err) {
		if (err) return res.apiError('database error', err);
		return res.json({
			counts: counts,
		});
	});
};
