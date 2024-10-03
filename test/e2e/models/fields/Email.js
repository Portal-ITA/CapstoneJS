var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Email = new capstone.List('Email', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Email.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Email,
		initial: true,
		index: true,
	},
	fieldB: {
		type: Types.Email,
		index: true,
	},
});

Email.defaultColumns = 'name, fieldA, fieldB';
Email.register();

module.exports = Email;
