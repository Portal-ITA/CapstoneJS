var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Textarea = new capstone.List('Textarea', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Textarea.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Textarea,
		initial: true,
	},
	fieldB: {
		type: Types.Textarea,
	},
});

Textarea.defaultColumns = 'name, fieldA, fieldB';
Textarea.register();

module.exports = Textarea;
