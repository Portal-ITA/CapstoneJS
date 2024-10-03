var capstone = require('../../../index.js');
var User = require('./User');

var Member = new capstone.List('Member', {
	inherits: User,
	track: true,
});

Member.register();

module.exports = Member;
