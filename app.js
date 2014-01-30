'use strict';

var express = require('express');
var async = require('async');
var http = require('http');
var socket = require('socket.io');
var sizlate = require('sizlate');

var app = express();
var fs = require('fs');
var standardTemplate = fs.readFileSync('./views/partials/standard.sizlate').toString('utf8');
app.use(require('./blender.js')); // content negotiation.

var cache;

app.configure(function() {
	app.set('port', process.env.PORT || 4400);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'sizlate');
});

app.use(express.static('public'));


var widgets = require('./widgets.js');

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
	var methods = {};
	for (var stat in widgets) {
		methods[stat] = widgets[stat].data;
	}
	async.parallel(methods, function(error, data) {
		callback(null, data);
	});
}

/**
 * Keys the items by the widget name
 * @param  {Array} selectors As provided by fetchAllWidgetData
 *                           eg: [{id: 'bob', title: ''}, {..}]
 * @return {Object}           { 'bob': { title: '' } ... }
 */
function arrayToObj(selectors) {
	var out = {};
	for (var widget = 0; widget < selectors.length; widget++) {
		if (selectors[widget]) {
			out[selectors[widget].widget] = selectors[widget];
		}
	}
	return out;
}

// on startup get the latest data.
fetchAllWidgetData(function(errorSet, dataSet) {
	cache = dataSet;
	//console.log('cache is', cache);
});

// setInterval(function() {
// 	fetchAllWidgetData(function(es, ds) {
// 		for (var widget in cache) {
// 			//if (JSON.stringify(cache[widget]) != JSON.stringify(ds[widget])) {
// 				// something changed.
// 				var o = {};
// 				var selectors = widgets[widget].selectors(ds[widget])['.widget'].data;
// 				o[widget] = sizlate.doRender(standardTemplate, selectors);
// 				notifyClients(o);
// 			//}
// 		}
// 		cache = ds;
// 	});
// }, 5000);


/**
 * Notify connected clients that there is a new value.
 * @param  {[type]} update {widgetName: widgetValue}
 * @return {[type]}        [description]
 */
function notifyClients(update) {
	for (var socket in sockets) {
		sockets[socket].emit('widget', update);
	}
}


function generateSelectors(data) {
	var selectors = {};
	for (var item in data) {
		var key = '#' + item;
		console.log('___---___--_---__,>', widgets[item].selectors(data[item]));
		selectors[key] = widgets[item].selectors(data[item])['.widget'];
	}
	return selectors;
}


app.get('/', function(req, res) {
	res.blender({
		buildData: function(params, callback) {
			callback(null, cache);
		},
		template: 'all',
		layout: 'layout',
		container: '#widgets',
		buildSelectors: function(data, callback) {
			callback(generateSelectors(cache));
		}
	});
});

app.get('/widget/:widgetId', function(req, res) {
	res.blender({
		buildData: function(params, callback) {
			callback(null, cache[req.params.widgetId]);
		},
		layout: 'layout',
		template: 'single',
		container: '#widgets',
		buildSelectors: function(data, callback) {
			return callback(widgets[data.widget].selectors(data));
		}
	});
});


var server = http.createServer(app);

server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});


var io = socket.listen(server);

// dont spam logs - nice
io.set('log level', 1);

var sockets = {};

io.sockets.on('connection', function(socket) {
  if (!sockets) {
    sockets = {};
  }
  sockets[socket.id] = socket;
  socket.on('disconnect', function() {
    delete sockets[socket.id];
  });
});
