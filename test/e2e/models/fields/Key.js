var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Key = new capstone.List('Key', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Key.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Key,
		initial: true,
	},
	fieldB: {
		type: Types.Key,
	},
});

Key.defaultColumns = 'name, fieldA, fieldB';
Key.register();

module.exports = Key;
