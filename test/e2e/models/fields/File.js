var capstone = require('../../../../index.js');
var Types = capstone.Field.Types;

var File = new capstone.List('File', {
	autokey: {
		path: 'key',
		from: 'name',
		unique: true,
	},
	track: true,
});

var localStorage = new capstone.Storage({
	adapter: capstone.Storage.Adapters.FS,
	fs: {
		path: 'data/files',
		publicPath: '/files',
	},
});

File.add({
	name: {
		type: String,
		initial: true,
		required: true,
		index: true,
	},
	fieldA: {
		type: Types.File,
		storage: localStorage,
	},
	fieldB: {
		type: Types.File,
		storage: localStorage,
	},
});

File.defaultColumns = 'name, fieldA, fieldB';
File.register();

module.exports = File;
