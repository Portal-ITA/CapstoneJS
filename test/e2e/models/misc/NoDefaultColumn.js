var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var NoDefaultColumn = new capstone.List('NoDefaultColumn', {
	track: true,
});

NoDefaultColumn.add({
	fieldA: {
		type: Types.Text,
		initial: true,
	},
	fieldB: {
		type: Types.Text,
	},
});

NoDefaultColumn.register();

module.exports = NoDefaultColumn;
