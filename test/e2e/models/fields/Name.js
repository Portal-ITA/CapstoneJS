var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var Name = new capstone.List('Name', {
	autokey: {
		path: 'key', 
		from: 'name', 
		unique: true,
	},
	track: true,
});

Name.add({
	name: {
		type: String, 
		initial: true, 
		required: true, 
		index: true,
	},
	fieldA: {
		type: Types.Name, 
		initial: true, 
		index: true,
	},
	fieldB: {
		type: Types.Name, 
		index: true,
	},
});

Name.defaultColumns = 'name, fieldA, fieldB';
Name.register();

module.exports = Name;
