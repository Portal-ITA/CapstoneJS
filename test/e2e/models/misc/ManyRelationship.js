var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var ManyRelationship = new capstone.List('ManyRelationship');

ManyRelationship.add({
	name: { type: String, initial: true, index: true },
	fieldA: { type: Types.Relationship, ref: 'Text', initial: true, many: true },
});

ManyRelationship.register();
module.exports = ManyRelationship;
