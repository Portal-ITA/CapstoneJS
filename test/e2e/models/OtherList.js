var capstone = require('../../../index.js');
var Types = capstone.Field.Types;

var OtherList = new capstone.List('OtherList', {
	autokey: {path: 'key', from: 'name', unique: true},
	track: true
});

OtherList.add({
	name: {
		type: Types.Name, 
		required: true, 
		index: true
	},
});

OtherList.defaultColumns = 'name';
OtherList.register();

module.exports = OtherList;
