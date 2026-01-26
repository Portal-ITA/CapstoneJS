var LDAP = require('ldapjs');
var utils = require('keystone-utils');
var session = require('../../../../lib/session');

function signin (req, res) {
    var capstone = req.capstone;

    var seclog = capstone.get('seclog');

	if (!capstone.security.csrf.validate(req)) {
		return res.apiError(403, 'invalid csrf');
	}
	if (!req.body.email || !req.body.password) {
		return res.status(401).json({ error: 'email and password required' });
	}
    var User = capstone.list(capstone.get('user model'));
	var emailRegExp = new RegExp('^' + utils.escapeRegExp(String(req.body.email) || '') + '$', 'i');
	User.model.findOne({ email: emailRegExp }).exec(function (err, user) {
		if (user) {
            var ldapServer = capstone.get('ldap server');
            if (!ldapServer) {
                var reason = `error: 'using app database authentication', reason: 'ldap server not defined'`;
                seclog.warn(reason);
                capstone.callHook(user, 'pre:signin', req, function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'pre:signin error', detail: err });
                    }
                    user._.password.compare(req.body.password, function (err, isMatch) {
                        if (isMatch) {
                            session.signinWithUser(user, req, res, function () {
                                capstone.callHook(user, 'post:signin', req, function (err) {
                                    if (err) {
                                        return res.status(500).json({ error: 'post:signin error', detail: err });
                                    }
                                    res.json({ success: true, user: user });
                                });
                            });
                        } else if (err) {
                            return res.status(500).json({ error: 'bcrypt error', detail: err });
                        } else {
                            return res.status(401).json({ error: 'invalid details' });
                        }
                    });
                });
            }
            else {
                capstone.callHook(user, 'pre:signin', req, function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'pre:signin error', detail: err });
                    }
                    try {
                        var ldap = LDAP.createClient(ldapServer);
                        var searchUserQueryId = capstone.get('ldap query user id');
                        var modelUserId = capstone.get('default model user id');
                        var searchBaseQuery = capstone.get('ldap query base');
                        var userIdent = user[modelUserId]
                        var userDN = `${searchUserQueryId}=${userIdent},${searchBaseQuery}`;
                        ldap.bind(userDN, req.body.password, function(err) {
                            if (err) {
                                var reason = `error: '${err.message}', user: '${userDN}', reason: 'ldap.bind'`;
                                seclog.error(reason);
                                return res.status(401).json({ error: 'post:signin error', detail: err });
                            }
                            else {
                                var reason = `'${userIdent} authenticated as ${userDN}'`;
                                seclog.info(reason);
                                session.signinWithUser(user, req, res, function () {
                                    capstone.callHook(user, 'post:signin', req, function (err) {
                                        if (err) {
                                            return res.status(500).json({ error: 'post:signin error', detail: err });
                                        }
                                        res.json({ success: true, user: user });
                                    });
                                });
                            }
                        });
                    }
                    catch(err) {
                        seclog.error(`error: '${err.message}', user: '${userDN}', reason: 'ldap.bind'`);
                        return res.status(500).json({ error: 'post:signin error', detail: err });
                    }
                });
            }
        }
        else if (err) {
			return res.status(500).json({ error: 'database error', detail: err });
        }
        else {
			return res.status(401).json({ error: 'invalid details' });
		}
	});
}

module.exports = signin;
