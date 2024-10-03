var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

// Model to demonstrate issue #2929

var DateFieldMap = new capstone.List('DateFieldMap', {
	map: { name: 'datefield' },
});

DateFieldMap.add({
	datefield: { type: Types.Date, initial: true },
});

DateFieldMap.register();
DateFieldMap.defaultColumns = 'datefield';

module.exports = DateFieldMap;
