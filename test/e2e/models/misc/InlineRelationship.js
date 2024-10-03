var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var InlineRelationship = new capstone.List('InlineRelationship');

InlineRelationship.add({
	fieldA: { type: Types.Relationship, ref: 'User', createInline: true },
});

InlineRelationship.register();
module.exports = InlineRelationship;
