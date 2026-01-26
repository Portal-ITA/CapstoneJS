var crypto = require('crypto');
var capstone = require('../');
var scmp = require('scmp');
var utils = require('keystone-utils');
var LDAP = require('ldapjs');
var _ = require('lodash');

/**
 * Retrieve the list of roles for the user
 *
 * @param {String} userIdent - user id
 * @param {function()} onSuccess callback, is passed the user roles
 */
function ldapRoles (userIdent, onSuccess) {

    var seclog = capstone.get('seclog');

    seclog.info(`Searching roles for '${userIdent}' in LDAP server`);

    if (arguments.length < 2) {
		throw new Error('capstone.session.ldapRoles requires userIdent and an onSuccess callback.');
	}
    if (typeof onSuccess !== 'function') {
		throw new Error('capstone.session.ldapRoles requires onSuccess to be a function.');
	}

    var ldapServer = capstone.get('ldap server');
    if (!ldapServer) {
        var reason = `using role from DB - ldap server not defined`;
        seclog.error(reason);
        onSuccess(null);
    }
    else {
        try {
            var ldap = LDAP.createClient(ldapServer);
            var ldapAuthUser = capstone.get('ldap auth user');
            if (!ldapAuthUser) {
                seclog.info(`LDAP server auth user not set`);
                onSuccess(null);
            }
            else {
                seclog.info(`Using LDAP server auth user '${ldapAuthUser}'`);
                var ldapAuthPassword = capstone.get('ldap auth password');
                ldap.bind(ldapAuthUser, ldapAuthPassword, function(err) {
                    if (err) {
                        var reason = `error: ${err.message}, reason: 'ldap.bind'`;
                        seclog.error(reason);
                        onSuccess(null);
                    }
                    else {
                        seclog.info(`user '${userIdent}' bound in LDAP server`);
                        var searchBaseQuery = capstone.get('ldap query base');
                        var searchUserQuery = capstone.get('ldap query user');
                        var searchUserQueryId = capstone.get('ldap query user id');
                        var searchUserQueryClass = capstone.get('ldap query user class');
                        var filter = `(&(${searchUserQueryClass})(${searchUserQueryId}=${userIdent}))`;
                        seclog.info(`LDAP query: '${filter}'`);
                        searchUserQuery.filter = filter;
                        var roles = [];
                        ldap.search(searchBaseQuery, searchUserQuery, function(err, ldapUser) {
                            if (err) {
                                var reason = `error: ${err.message}, reason: 'ldap.search/searchUserQuery'`;
                                seclog.error(reason);
                                onSuccess(null);
                            }
                            else {
                                seclog.info(`user '${userIdent}' found in LDAP server`);
                                ldapUser.on('searchEntry', (entry) =>  {
                                    seclog.info(`scanning user '${userIdent}' entries in LDAP server`);
                                    var searchRoleQuery = capstone.get('ldap query role');
                                    if (searchRoleQuery) {
                                        /**
                                        * Roles from LDAP user profile
                                        */
                                        var filter = `(&(objectClass=groupOfNames)(member=${searchUserQueryId}=${userIdent}))`;
                                        seclog.info(`LDAP query: '${filter}'`);
                                        searchRoleQuery.filter = filter
                                        ldap.search(searchBaseQuery, searchRoleQuery, function(err, ldapRole) {
                                            seclog.info(`searching user '${userIdent}' entries in LDAP server`);
                                            if (err) {
                                                var reason = `error: ${err.message}, reason: 'ldap.search/searchRoleQuery'`;
                                                seclog.error(reason);
                                                onSuccess(null);
                                            }
                                            else {
                                                ldapRole.on('searchEntry', function(entry) {
                                                    roles.push(entry.dn);
                                                });
                                                ldapRole.on('end', function(result) {
                                                if (roles.length)
                                                    onSuccess(roles);
                                                else
                                                    onSuccess(null);
                                                });
                                                ldapRole.on('error', function(err) {
                                                    var reason = `error: ${err.message}, reason: 'ldap.search/ldapRole.on/error'`;
                                                    seclog.error(reason);
                                                    onSuccess(null);
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        /**
                                         * Roles should be obtained from DB user profile
                                         */
                                        onSuccess(null)
                                    }
                                });
                                ldapUser.on('end', (result) => {
                                    seclog.error(`user ${userIdent} has no roles defined in LDAP server`);
                                    onSuccess(null);
                                });
                                ldapUser.on('error', (err) => {
                                    seclog.error(`error: ${err.message}, reason: 'ldap.search/ldapUser.on/error'`);
                                    onSuccess(null);
                                });
                            }
                        });
                    }
                });
            }
        }
        catch(err) {
            seclog.error(`error: '${err.message}', user: '${userDN}', reason: 'ldap.bind'`);
            onSuccess(null);
        }
    }

}

/**
 * Creates a hash of str with Capstone's cookie secret.
 * Only hashes the first half of the string.
 */
function hash (str) {
	// force type
	str = '' + str;
	// get the first half
	str = str.substr(0, Math.round(str.length / 2));
	// hash using sha256
	return crypto
		.createHmac('sha256', capstone.get('cookie secret'))
		.update(str)
		.digest('base64')
		.replace(/\=+$/, '');
}

/**
 * Signs in a user using user obejct
 *
 * @param {Object} user - user object
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {function()} onSuccess callback, is passed the User instance
 */

function signinWithUser (user, req, res, onSuccess) {
	if (arguments.length < 4) {
		throw new Error('capstone.session.signinWithUser requires user, req and res objects, and an onSuccess callback.');
	}
	if (typeof user !== 'object') {
		throw new Error('capstone.session.signinWithUser requires user to be an object.');
	}
	if (typeof req !== 'object') {
		throw new Error('capstone.session.signinWithUser requires req to be an object.');
	}
	if (typeof res !== 'object') {
		throw new Error('capstone.session.signinWithUser requires res to be an object.');
	}
	if (typeof onSuccess !== 'function') {
		throw new Error('capstone.session.signinWithUser requires onSuccess to be a function.');
	}
	req.session.regenerate(function () {
        var seclog = capstone.get('seclog');
        var modelUserId = capstone.get('default model user id');
        var modelRoleId = capstone.get('default model role id');
        var userIdent = user[modelUserId];
	    seclog.info(`searching user '${userIdent}' roles`);
        ldapRoles(userIdent, function(roles) {
	        seclog.info(`User '${userIdent}' roles '${roles}' fom LDAP`);
            if (Array.isArray(roles) && roles.length){
                req.profile = roles;
                seclog.info(`User '${userIdent}' assuming role '${req.profile}' from LDAP in session signin`);
            }
            else{
                req.profile = user[modelRoleId];
                seclog.info(`User '${userIdent}' assuming role '${req.profile}' from DB in session signin`);
            }
            req.user = user;
            req.session.userId = user.id;
            // if the user has a password set, store a persistent cookie to resume sessions
            if (capstone.get('cookie signin') && user.password) {
                var userToken = user.id + ':' + hash(user.password);
                var cookieOpts = _.defaults({}, capstone.get('cookie signin options'), {
                    signed: true,
                    httpOnly: true,
                    maxAge: 10 * 24 * 60 * 60 * 1000,
                });
                if (req.session.cookie) {
                    req.session.cookie.maxAge = cookieOpts.maxAge;
                }
                res.cookie('capstone.uid', userToken, cookieOpts);
            }
            onSuccess(user);
        });
	});
}

exports.signinWithUser = signinWithUser;

var postHookedSigninWithUser = function (user, req, res, onSuccess, onFail) {
	capstone.callHook(user, 'post:signin', req, function (err) {
		if (err) {
			return onFail(err);
		}
		exports.signinWithUser(user, req, res, onSuccess, onFail);
	});
};

/**
 * Signs in a user user matching the lookup filters
 *
 * @param {Object} lookup - must contain email and password
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {function()} onSuccess callback, is passed the User instance
 * @param {function()} onFail callback
 */

var doSignin = function (lookup, req, res, onSuccess, onFail) {

    var seclog = capstone.get('seclog');

	if (!lookup) {
		return onFail(new Error('session.signin requires a User ID or Object as the first argument'));
	}
	var User = capstone.list(capstone.get('user model'));
	if (typeof lookup.email === 'string' && typeof lookup.password === 'string') {
		// ensure that it is an email, we don't want people being able to sign in by just using "\." and a haphazardly correct password.
		if (!utils.isEmail(lookup.email)) {
			return onFail(new Error('Incorrect email or password'));
		}
		// create regex for email lookup with special characters escaped
		var emailRegExp = new RegExp('^' + utils.escapeRegExp(String(lookup.email || '')) + '$', 'i');
		// match email address and password
		User.model.findOne({ email: emailRegExp }).exec(function (err, user) {
			if (user) {
                user._.password.compare(lookup.password, function (err, isMatch) {
                    if (!err && isMatch) {
                        postHookedSigninWithUser(user, req, res, onSuccess, onFail);
                    } else {
                        var reason = `error: 'access denied to user "${lookup.email}"', reason: 'wrong password'`;
                        seclog.error(reason);
                        onFail(err || new Error('Incorrect email or password'));
                    }
                });
            }
            else {
                seclog.error(`user '${lookup.email}' not found in DB`);
				onFail(err);
			}
		});
	} else {
		lookup = '' + lookup;
		// match the userId, with optional password check
		var userId = (lookup.indexOf(':') > 0) ? lookup.substr(0, lookup.indexOf(':')) : lookup;
		var passwordCheck = (lookup.indexOf(':') > 0) ? lookup.substr(lookup.indexOf(':') + 1) : false;
		User.model.findById(userId).exec(function (err, user) {
			if (user && (!passwordCheck || scmp(passwordCheck, hash(user.password)))) {
				postHookedSigninWithUser(user, req, res, onSuccess, onFail);
			} else {
				onFail(err || new Error('Incorrect user or password'));
			}
		});
    }

};

exports.signin = function (lookup, req, res, onSuccess, onFail) {
	capstone.callHook({}, 'pre:signin', req, function (err) {
		if (err) {
			return onFail(err);
		}
		doSignin(lookup, req, res, onSuccess, onFail);
	});
};

/**
 * Signs the current user out and resets the session
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {function()} next callback
 */

exports.signout = function (req, res, next) {
    var seclog = capstone.get('seclog');
	capstone.callHook(req.user, 'pre:signout', function (err) {
		if (err) {
			console.log("An error occurred in signout 'pre' middleware", err);
		}
		var cookieOpts = _.defaults({}, capstone.get('cookie signin options'), {
			signed: true,
			httpOnly: true,
		});
		// Force the cookie to expire!
		cookieOpts.maxAge = 0;
        res.clearCookie('capstone.uid', cookieOpts);
        var reason = `info: 'user: ${req.user.email}', role: '${req.profile}',  reason: 'signed out'`;
        seclog.info(reason);
        req.profile = null;
		req.user = null;
		req.session.regenerate(function (err) {
			if (err) {
				return next(err);
			}
			capstone.callHook({}, 'post:signout', function (err) {
				if (err) {
					console.log("An error occurred in signout 'post' middleware", err);
                }
				next();
			});
		});
	});
};

/**
 * Middleware to ensure session persistence across server restarts
 *
 * Looks for a userId cookie, and if present, and there is no user signed in,
 * automatically signs the user in.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {function()} next callback
 */

exports.persist = function (req, res, next) {
    var seclog = capstone.get('seclog');
	var User = capstone.list(capstone.get('user model'));
	if (!req.session) {
		console.error('\nCapstoneJS Runtime Error:\n\napp must have session middleware installed. Try adding "express-session" to your express instance.\n');
		process.exit(1);
	}
	if (capstone.get('cookie signin') && !req.session.userId && req.signedCookies['capstone.uid'] && req.signedCookies['capstone.uid'].indexOf(':') > 0) {
		exports.signin(req.signedCookies['capstone.uid'], req, res, function () {
			next();
		}, function (err) {
			var cookieOpts = _.defaults({}, capstone.get('cookie signin options'), {
				signed: true,
				httpOnly: true,
			});
			// Force the cookie to expire!
			cookieOpts.maxAge = 0;
			res.clearCookie('capstone.uid', cookieOpts);
            req.profile = null;
            req.user = null;
			next();
		});
	} else if (req.session.userId) {
		User.model.findById(req.session.userId).exec(function (err, user) {
			if (err) return next(err);
            var modelUserId = capstone.get('default model user id');
            var modelRoleId = capstone.get('default model role id');
            var userIdent = user[modelUserId];
            ldapRoles(userIdent, function(roles) {
                seclog.info(`User '${userIdent}' roles '${roles}' from LDAP`);
                if (Array.isArray(roles) && roles.length){
                    req.profile = roles;
                    seclog.info(`User '${userIdent}' assuming role '${req.profile}' from LDAP in persist session`);
                }
                else{
                    req.profile = user[modelRoleId];
                    seclog.info(`User '${userIdent}' assuming role '${req.profile}' from DB in persist session`);
                }
                req.user = user;
                return next();
            });
		});
	} else {
		next();
	}
};

/**
 * Middleware to enable access to Capstone
 *
 * Bounces the user to the signin screen if they are not signed in or do not have permission.
 *
 * req.user is the user returned by the database. It's type is Capstone.List.
 *
 * req.user.canAccessCapstone denotes whether the user has access to the admin panel.
 * If you're having issues double check your user model. Setting `canAccessCapstone` to true in
 * the database will not be reflected here if it is virtual.
 * See http://mongoosejs.com/docs/guide.html#virtuals
 *
 * @param {Object} req - express request object
 * @param req.user - The user object Capstone.List
 * @param req.user.canAccessCapstone {Boolean|Function}
 * @param {Object} res - express response object
 * @param {function()} next callback
 */

exports.capstoneAuth = function (req, res, next) {
	if (!req.user || !req.user.canAccessCapstone) {
		if (req.headers.accept === 'application/json') {
			return req.user
				? res.status(403).json({ error: 'not authorised' })
				: res.status(401).json({ error: 'not signed in' });
		}
		var regex = new RegExp('^\/' + capstone.get('admin path') + '\/?$', 'i');
		var from = regex.test(req.originalUrl) ? '' : '?from=' + req.originalUrl;
		return res.redirect(capstone.get('signin url') + from);
	}
	next();
};

/**
 * Middleware to translations
 */
exports.getLanguage = function (req) {
    if (!req.session.translation)
        req.session.translation = capstone.get('language');

    return req.session.translation;
}

exports.setLanguage = function (req, language) {
    var supported = capstone.get('supported languages');
    if (supported.includes(language))
        req.session.translation = language;
    else
        throw new Error(`capstone.session.setLanguage requires one of [${supported}] languages.`);

    return req.session.translation;
}
