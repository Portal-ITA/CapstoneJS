var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Color = new capstone.List('Color', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Color.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Color,
		initial: true,
	},
	fieldB: {
		type: Types.Color,
	},
});

Color.defaultColumns = 'name, fieldA, fieldB';
Color.register();

module.exports = Color;
