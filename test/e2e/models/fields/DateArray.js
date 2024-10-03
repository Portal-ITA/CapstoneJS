var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var DateArray = new capstone.List('DateArray', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

DateArray.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.DateArray,
	},
	fieldB: {
		type: Types.DateArray,
	},
});

DateArray.defaultColumns = 'name, fieldA, fieldB';
DateArray.register();

module.exports = DateArray;
