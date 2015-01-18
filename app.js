'use strict';

var express = require('express');
var app = express();
var socket = require('socket.io');
var http = require('http');

var Models = require('./model/Models.base');

var HOME = require('./routes/home');
var ABOUT = require('./routes/about');
var SEARCH = require('./routes/search');
var STATION = require('./routes/station');

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


app.get('/', HOME.bind(null, models.station));
app.get('/search', SEARCH);
app.get('/about', ABOUT);
app.get('/:line/:station', STATION.bind(null, models.station));
