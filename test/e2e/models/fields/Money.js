var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Money = new capstone.List('Money', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

Money.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.Money,
		initial: true,
	},
	fieldB: {
		type: Types.Money,
	},
});

Money.defaultColumns = 'name, fieldA, fieldB';
Money.register();

module.exports = Money;
