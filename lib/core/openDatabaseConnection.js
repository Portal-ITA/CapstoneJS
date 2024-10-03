var debug = require('debug')('capstone:core:openDatabaseConnection');
var translations = require('capstone-intl');

module.exports = function openDatabaseConnection (callback) {

	var capstone = this;
	var mongoConnectionOpen = false;

	// support replica sets for mongoose
	if (capstone.get('mongo replica set')) {

		if (capstone.get('logger')) {
			console.log('\nWarning: using the `mongo replica set` option has been deprecated and will be removed in'
				+ ' a future version.\nInstead set the `mongo` connection string with your host details, e.g.'
				+ ' mongodb://username:password@host:port,host:port,host:port/database and set any replica set options'
				+ ' in `mongo options`.\n\nRefer to https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html'
				+ ' for more details on the connection settings.');
		}

		debug('setting up mongo replica set');
		var replicaData = capstone.get('mongo replica set');
		var replica = '';

		var credentials = (replicaData.username && replicaData.password) ? replicaData.username + ':' + replicaData.password + '@' : '';

		replicaData.db.servers.forEach(function (server) {
			replica += 'mongodb://' + credentials + server.host + ':' + server.port + '/' + replicaData.db.name + ',';
		});

		var options = {
			auth: { authSource: replicaData.authSource },
			replset: {
				rs_name: replicaData.db.replicaSetOptions.rs_name,
				readPreference: replicaData.db.replicaSetOptions.readPreference,
			},
			useMongoClient: true,
		};

		debug('connecting to replica set');
		capstone.mongoose.connect(replica, options);

	} else {
		debug('connecting to mongo');
		capstone.initDatabaseConfig();
		var options = capstone.get('mongo options') || {};
		options.useMongoClient = true;
        capstone.mongoose.connect(capstone.get('mongo'), options);
        capstone.mongoose.plugin(translations, { 
            languages: capstone.get('supported languages'), 
            defaultLanguage: capstone.get('language'),
        });
	}

	capstone.mongoose.connection.on('error', function (err) {

		// The DB connection has been established previously and this a ValidationError caused by restrictions Mongoose is enforcing on the field value
		// We can ignore these here; they'll also be picked up by the 'error' event listener on the model; see /lib/list/register.js
		if (mongoConnectionOpen && err && err.name === 'ValidationError') return;

		// Alternatively, the error is legitimate; output it
		console.error('------------------------------------------------');
		console.error('Mongoose connection "error" event fired with:');
		console.error(err);

		// There's been an error establishing the initial connection, ie. Capstone is attempting to start
		if (!mongoConnectionOpen) {
			throw new Error('CapstoneJS (' + capstone.get('name') + ') failed to start - Check that you are running `mongod` in a separate process.');
		}

		// Otherwise rethrow the initial error
		throw err;

	}).once('open', function () {

		debug('mongo connection open');
		mongoConnectionOpen = true;

		var connected = function () {
			if (capstone.get('auto update')) {
				debug('applying auto update');
				capstone.applyUpdates(callback);
			} else {
				callback();
			}
		};

		if (capstone.sessionStorePromise) {
			capstone.sessionStorePromise.then(connected);
		} else {
			connected();
		}

	});

	return this;
};
