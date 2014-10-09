 var express = require('express');
 var app = express();
var async = require('async');
var socket = require('socket.io');
var http = require('http');




var cache = {};
var nextTrain = require('./fetchers/next-train.js');
var tflStatus = require('./fetchers/tfl-status.js');

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: tflStatus,
        nextTrain: nextTrain
    };
    async.parallel(methods, function(error, data) {
        callback(null, data);
    });
}

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
    console.log('notify', widget);
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
}, 1000);


 app.get("/", function(req, res) {
    fetchAllWidgetData(function(error, data) {
        res.render('layout.jade', data);
    });
 });


 app.use(express.static('public'));
 
 var server = http.createServer(app);

 
 server.listen(4000, function() {
   console.log("Listening on " + 4000);
 });


 var io = socket.listen(server);

 // dont spam logs - nice
 io.set('log level', 1);

 var sockets = {};

 io.sockets.on('connection', function(socket) {
    console.log('connection')
   sockets[socket.id] = socket;
   socket.on('disconnect', function() {
     delete sockets[socket.id];
   });
 });