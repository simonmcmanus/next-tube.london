'use strict';

var http = require('http');

var selectorConverter = function(data) {
	var out = {};
	out['.widget'] = {
		partial: 'standard',
		data: [{
			'id': data.widget,
			'h2': data.widget,
			'.value': data.value + ' ' + data.unit
		}]
	};
	return out;
};


var cheerio =  require('cheerio');
var request = require('request');

module.exports = {

	// nextTrain: {
	// 	data: function(callback) {
	// 		request(
	// 			'http://www.tfl.gov.uk/tfl/livetravelnews/realtime/tube/default.html',
	// 			function(error, data) {
	// 			var $ = cheerio.load(data.body);
	// 			callback(null, {
	// 				widget: 'nextTrain',
	// 				status: 'bad',
	// 				value: $('#lines').html(),
	// 				unit: 'Hours'
	// 			});
	// 		});
	// 	},
	// 	selectors: selectorConverter
	// },
	uptime: {
		data: function(callback){
			callback(null, {
				widget: 'uptime',
				status: 'bad',
				value: Math.random().toString().slice(-1),
				unit: 'Hours'
			});
		},
		selectors: selectorConverter
	},
	build: {
		data: function(callback){
			callback(null, {
				widget: 'build',
				status: 'bad',
				value: Math.random().toString().slice(-1),
				unit: 'Hours'
			});
		},
		selectors: selectorConverter
	},
	flight: {
		data: function(callback){
			callback(null, {
				widget: 'flight',
				status: 'bad',
				value: Math.random().toString().slice(-1),
				unit: 'Hours'
			});
		},
		selectors: selectorConverter
	}
};
