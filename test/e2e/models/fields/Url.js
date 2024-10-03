var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Url = new capstone.List('Url', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Url.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Url,
		initial: true,
	},
	fieldB: {
		type: Types.Url,
	},
});

Url.defaultColumns = 'name, fieldA, fieldB';
Url.register();

module.exports = Url;
