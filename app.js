'use strict';

var express = require('express');
var app = express();
var socket = require('socket.io');
var http = require('http');

var Models = require('./model/Models.base');

var HOME = require('./routes/home');
var STATION = require('./routes/station');

var nextTrain = require('./fetchers/next-train/next-train');



app.use(express.static('public'));


var server = http.createServer(app);
var port =  process.env.PORT || 4000;


server.listen(port, function () {
    console.log('Listening on ' + port);
});

var io = socket.listen(server);


var models = new Models({
    station: require('./model/station'),
    //status: require('./fetchers/tfl-status')
}, io, 5000);


app.get('/', HOME);
app.get('/central/:station', STATION.bind(null, models.station));




// io.sockets.on('connection', function (socket) {
//     Object.keys(nextTrain.events).forEach(function (ev) {
//         socket.on(ev, nextTrain.events[ev].bind(null, socket));
//     });
// });
