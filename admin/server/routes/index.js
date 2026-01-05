var _ = require('lodash');
var ejs = require('ejs');
var path = require('path');

var templatePath = path.resolve(__dirname, '../templates/index.html');

module.exports = function IndexRoute (req, res) {
	var capstone = req.capstone;
	var lists = {};
	_.forEach(capstone.lists, function (list, key) {
		lists[key] = list.getOptions();
	});

	var UserList = capstone.list(capstone.get('user model'));

	var orphanedLists = capstone.getOrphanedLists().map(function (list) {
		return _.pick(list, ['key', 'label', 'path']);
	});

	var backUrl = capstone.get('back url');
	if (backUrl === undefined) {
		// backUrl can be falsy, to disable the link altogether
		// but if it's undefined, default it to "/"
		backUrl = '/';
	}

	var capstoneData = {
		adminPath: '/' + capstone.get('admin path'),
		appversion: capstone.get('appversion'),
		backUrl: backUrl,
		brand: capstone.get('brand'),
		csrf: { header: {} },
		devMode: !!process.env.CAPSTONE_DEV,
		lists: lists,
		nav: capstone.nav,
		orphanedLists: orphanedLists,
		signoutUrl: capstone.get('signout url'),
		user: {
			id: req.user.id,
			name: UserList.getDocumentName(req.user) || '(no name)',
		},
		userList: UserList.key,
        version: capstone.version,
        language: capstone.session.getLanguage(req),
        languageList: capstone.get('supported languages'),
		wysiwyg: { options: {
			enableImages: capstone.get('wysiwyg images') ? true : false,
			enableCloudinaryUploads: capstone.get('wysiwyg cloudinary images') ? true : false,
			additionalButtons: capstone.get('wysiwyg additional buttons') || '',
			additionalPlugins: capstone.get('wysiwyg additional plugins') || '',
			additionalOptions: capstone.get('wysiwyg additional options') || {},
			overrideToolbar: capstone.get('wysiwyg override toolbar'),
			skin: capstone.get('wysiwyg skin') || 'capstone',
			menubar: capstone.get('wysiwyg menubar'),
			importcss: capstone.get('wysiwyg importcss') || '',
		} },
	};
	capstoneData.csrf.header[capstone.security.csrf.CSRF_HEADER_KEY] = capstone.security.csrf.getToken(req, res);

	var codemirrorPath = capstone.get('codemirror url path')
		? '/' + capstone.get('codemirror url path')
		: '/' + capstone.get('admin path') + '/js/lib/codemirror';

	var locals = {
		adminPath: capstoneData.adminPath,
		cloudinaryScript: false,
		codemirrorPath: codemirrorPath,
		env: capstone.get('env'),
		fieldTypes: capstone.fieldTypes,
		ga: {
			property: capstone.get('ga property'),
			domain: capstone.get('ga domain'),
		},
		capstone: capstoneData,
		title: capstone.get('name') || 'Capstone',
	};

	var cloudinaryConfig = capstone.get('cloudinary config');
	if (cloudinaryConfig) {
		var cloudinary = require('cloudinary');
		var cloudinaryUpload = cloudinary.uploader.direct_upload();
		capstoneData.cloudinary = {
			cloud_name: capstone.get('cloudinary config').cloud_name,
			api_key: capstone.get('cloudinary config').api_key,
			timestamp: cloudinaryUpload.hidden_fields.timestamp,
			signature: cloudinaryUpload.hidden_fields.signature,
		};
		locals.cloudinaryScript = cloudinary.cloudinary_js_config();
	};

	ejs.renderFile(templatePath, locals, { delimiter: '%' }, function (err, str) {
		if (err) {
			console.error('Could not render Admin UI Index Template:', err);
			return res.status(500).send(capstone.wrapHTMLError('Error Rendering Admin UI', err.message));
		}
		res.send(str);
	});
};
