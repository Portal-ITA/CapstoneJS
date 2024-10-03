var capstone = require('../../index.js');
var demand = require('must');
var path = require('path');
var getExpressApp = require('../helpers/getExpressApp');

describe('Capstone "module root" setting', function () {

	before(function () {
		getExpressApp();
	});

	describe('default', function () {

		it('should be set to the path where capstone was required', function () {
			demand(capstone.get('module root')).to.be(__dirname);
		});

		it('should be used by capstone.getPath()', function () {
			var viewsPath = 'relative/path/to/views'
			capstone.set('views', viewsPath);
			demand(capstone.getPath('views')).to.be(path.resolve(__dirname, viewsPath));
		});

	});

	describe('custom with relative path', function () {
		var customPath = '../..';

		before(function () {
			capstone.set('module root', customPath);
		});

		it('should return the custom configured path', function () {
			demand(capstone.get('module root')).to.be(path.resolve(__dirname, customPath));
		});

		it('should be used by capstone.getPath() to resolve relative paths', function () {
			var viewsPath = 'relative/path/to/views'
			capstone.set('views', viewsPath);
			demand(capstone.getPath('views')).to.be(path.resolve(__dirname, customPath, viewsPath));
		});
	});

	describe('custom with absolute path', function () {
		var customPath = path.resolve(__dirname, '../..');

		before(function () {
			capstone.set('module root', customPath);
		});

		it('should return the custom configured path', function () {
			demand(capstone.get('module root')).to.be(customPath);
		});

		it('should be used by capstone.getPath() to resolve relative paths', function () {
			var viewsPath = 'relative/path/to/views'
			capstone.set('views', viewsPath);
			demand(capstone.getPath('views')).to.be(path.resolve(customPath, viewsPath));
		});
	});
});
