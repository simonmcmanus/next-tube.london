'use strict';

var express = require('express');
var app = express();
var socket = require('socket.io');
var compression = require('compression'); // html
var http = require('http');

var Models = require('./model/Models.base');

var pjax = require('express-pjax');
var partials = require('express-partials');

app.use(compression());


var HOME = require('./routes/home');
var ABOUT = require('./routes/about');
var SEARCH = require('./routes/search');
var STATION = require('./routes/station');

app.use(express.static('public'));
app.use(pjax());
app.use(partials());
app.set('views', __dirname + '/pages');
app.set('view engine', 'jade');
app.set('view cache', true);

var server = http.createServer(app);
var port =  process.env.PORT || 3040;

server.listen(port, function () {
    console.log('Listening on ' + port);
});

var io = socket.listen(server);


console.log(port);
var models = new Models({
    station: require('./model/station'),
    //status: require('./fetchers/tfl-status')
}, io, 100000);


app.get('/', HOME.bind(null, models.station));
app.get('/search', SEARCH);
app.get('/about', ABOUT);
app.get('/:line/:station', STATION.bind(null, models.station));

console.log('running in', process.env['NODE_ENV'], app.get('view cache'));
