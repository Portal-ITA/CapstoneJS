var capstone = require('../../../../index');
var Types = capstone.Field.Types;

var SourceRelationship = new capstone.List('SourceRelationship');

SourceRelationship.add({
	name: {
		type: String,
		initial: true,
	},
	fieldA: { 
		type: Types.Relationship, 
		ref: 'TargetRelationship'
	},
});

SourceRelationship.register();
SourceRelationship.defaultColumns = 'name, fieldA';

module.exports = SourceRelationship;
