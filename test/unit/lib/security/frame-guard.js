var capstone = require('../../../../index.js');
var demand = require('must');
var request = require('supertest');
var demand = require('must');
var getExpressApp = require('../../../helpers/getExpressApp');
var app = getExpressApp();
var frameGuard = require('../../../../lib/security/frameGuard');

describe('Capstone "frame guard" setting', function () {
	before(function () {
		app.use(frameGuard(capstone));
		app.get('/', function (req, res) {
			res.send('OK');
		});
	});

	describe('default setting', function () {

		it('should be "sameorigin"', function () {
			demand(capstone.get('frame guard')).to.be('sameorigin');
		});

	});

	describe('capstone.set("frame guard")', function () {

		it('should allow setting to "sameorigin"', function () {
			capstone.set('frame guard', 'sameorigin');
			demand(capstone.get('frame guard')).to.be('sameorigin');
		});

		it('should allow setting to "deny"', function () {
			capstone.set('frame guard', 'deny');
			demand(capstone.get('frame guard')).to.be('deny');
		});

		it('should allow setting to TRUE, converts to "deny"', function () {
			capstone.set('frame guard', true);
			demand(capstone.get('frame guard')).to.be('deny');
		});

		it('should allow setting to FALSE', function () {
			capstone.set('frame guard', false);
			demand(capstone.get('frame guard')).to.be(false);
		});

		it('should translate invalid options to FALSE', function () {
			capstone.set('frame guard', 'xxx');
			demand(capstone.get('frame guard')).to.be(false);
			capstone.set('frame guard', 999);
			demand(capstone.get('frame guard')).to.be(false);
			capstone.set('frame guard', []);
			demand(capstone.get('frame guard')).to.be(false);
			capstone.set('frame guard', {});
			demand(capstone.get('frame guard')).to.be(false);
		});

	});

	describe('X-Frame-Options header', function () {

		it('should be set to "deny" when "frame guard" is "deny"', function (done) {
			capstone.set('frame guard', 'deny');
			request(app)
				.get('/')
				.expect('x-frame-options', 'deny')
				.expect(200, done);
		});

		it('should be set to "sameorigin" when "frame guard" is "sameorigin"', function (done) {
			capstone.set('frame guard', 'sameorigin');
			request(app)
				.get('/')
				.expect('x-frame-options', 'sameorigin')
				.expect(200, done);
		});

		it('should be set to "deny" when "frame guard" is TRUE', function (done) {
			capstone.set('frame guard', true);
			request(app)
				.get('/')
				.expect('x-frame-options', 'deny')
				.expect(200, done);
		});

		it('should not be set when "frame guard" is FALSE', function (done) {
			capstone.set('frame guard', false);
			request(app)
				.get('/')
				.expect(function (res) {
					if (res.headers['x-frame-options']) {
						return 'X-Frame-Options key exists';
					}
				})
				.expect(200, done);
		});

	});

});
