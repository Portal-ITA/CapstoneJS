var capstone = require('../../index.js');
var Types = capstone.Field.Types;

// Simple model
var DependsOn = new capstone.List('DependsOn', {
	autokey: { path: 'slug', from: 'title', unique: true },
});

// Add index
DependsOn.add({
	title: { type: String, required: true, default: '' },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft' },
	publishedDate: { type: Types.Date, dependsOn: {state: 'published'}, required: true, initial: false },
});

DependsOn.register();
