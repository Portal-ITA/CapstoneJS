var mongoose = require('mongoose');

module.exports = mongoose.connect('mongodb://' + (process.env.CAPSTONEJS_HOST || 'localhost') + '/test');
