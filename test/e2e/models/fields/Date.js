var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Date = new capstone.List('Date', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Date.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Date,
		initial: true,
	},
	fieldB: {
		type: Types.Date,
	},
});

Date.defaultColumns = 'name, fieldA, fieldB';
Date.register();

module.exports = Date;
