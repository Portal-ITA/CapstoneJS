var capstone = require('../../../../index');
var Types = capstone.Field.Types;

var TargetRelationship = new capstone.List('TargetRelationship');

TargetRelationship.add({
	name: { 
		type: String,
		initial: true,
	},
});

TargetRelationship.relationship({
	ref: 'SourceRelationship',
	refPath: 'fieldA',
	path: 'sourceFieldA'
});

TargetRelationship.register();
TargetRelationship.defaultColumns = 'name';

module.exports = TargetRelationship;
