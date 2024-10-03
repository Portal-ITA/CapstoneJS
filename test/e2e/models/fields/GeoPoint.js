var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var GeoPoint = new capstone.List('GeoPoint', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

GeoPoint.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.GeoPoint,
		initial: true,
	},
	fieldB: {
		type: Types.GeoPoint,
	},
});

GeoPoint.defaultColumns = 'name, fieldA, fieldB';
GeoPoint.register();

module.exports = GeoPoint;
