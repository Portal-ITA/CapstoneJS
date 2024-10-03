/**
 * Exports an object of lists, keyed with their key instead of their name and
 * wrapped with the List helper (./List.js)
 */

import List from './List';

exports.listsByKey = {};
exports.listsByPath = {};

for (const key in Capstone.lists) {
	// Guard for-ins
	if ({}.hasOwnProperty.call(Capstone.lists, key)) {
		var list = new List(Capstone.lists[key]);
		exports.listsByKey[key] = list;
		exports.listsByPath[list.path] = list;
	}
}
