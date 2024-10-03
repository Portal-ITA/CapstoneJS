var capstone = require('../../../index.js');
var Types = capstone.Field.Types;

var SelectFieldOnInitial = new capstone.List('SelectFieldOnInitial', {
	autokey: {path: 'key', from: 'name', unique: true},
	track: true
});

SelectFieldOnInitial.add({
	name: {
		type: String,
		required: true,
		index: true
	},
	type: {
		type: Types.Select,
		options: 'Pizza, Burger, Hot Dog',
		required: true,
		initial: true,
		noedit: true,
		label: "Food Type",
		index: true
	},
});

SelectFieldOnInitial.defaultColumns = 'name, type';
SelectFieldOnInitial.register();

module.exports = SelectFieldOnInitial;
