var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var CloudinaryImageMultiple = new capstone.List('CloudinaryImageMultiple', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

CloudinaryImageMultiple.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.CloudinaryImages,
	},
	fieldB: {
		type: Types.CloudinaryImages,
	},
});

CloudinaryImageMultiple.defaultColumns = 'name, fieldA, fieldB';
CloudinaryImageMultiple.register();

module.exports = CloudinaryImageMultiple;
