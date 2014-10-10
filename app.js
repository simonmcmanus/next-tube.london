 var express = require('express');
 var app = express();
var async = require('async');
var socket = require('socket.io');
var http = require('http');

var nextTrain = require('./fetchers/next-train.js');
// requests always served from the cache and then updated over websockets.
var cache = {};

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: require('./fetchers/tfl-status.js'),
        nextTrain: function(next) {
            nextTrain('WFD', next);
        },
        nextBus: require('./fetchers/next-bus.js')
    };
    async.parallel(methods, function(error, data) {
        callback(null, data);
    });
};

// on startup get the latest data.
fetchAllWidgetData(function(errorSet, dataSet) {
    cache = dataSet;
});
 
 /**
 * Notify connected clients that there is a new value.
 * @param  {[type]} update {widgetName: widgetValue}
 * @return {[type]}        [description]
 */
function notifyClients(widget, data) {
    for (var socket in sockets) {
        sockets[socket].emit(widget, data);
    }
}

setInterval(function() {
    fetchAllWidgetData(function(es, ds) {
        for (var widget in cache) {
            if (JSON.stringify(cache[widget]) != JSON.stringify(ds[widget])) {
                notifyClients(widget, ds[widget]);
            }
        };
        cache = ds;
    });
}, 30000);

app.use(express.static('public')); 

app.get("/", function(req, res) {
    res.render('layout.jade', cache);
});

var server = http.createServer(app);
var port =  process.env.PORT || 4000;
server.listen(port, function() {
    console.log("Listening on " + port);
});

var io = socket.listen(server);
var sockets = {};

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;
    socket.on('disconnect', function() {
        delete sockets[socket.id];
    });
});