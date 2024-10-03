var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Relationship = new capstone.List('Relationship', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Relationship.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Relationship,
		ref: 'User',
		inline: true,
		initial: true,
	},
	fieldB: {
		type: Types.Relationship,
		ref: 'User',
	},
});

Relationship.defaultColumns = 'name, fieldA, fieldB';
Relationship.register();

module.exports = Relationship;
