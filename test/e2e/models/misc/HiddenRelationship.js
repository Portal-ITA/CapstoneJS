var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var HiddenRelationship = new capstone.List('HiddenRelationship');

HiddenRelationship.add({
	fieldA: { type: Types.Relationship, ref: 'User', initial: true, hidden: true },
});

HiddenRelationship.register();
module.exports = HiddenRelationship;
