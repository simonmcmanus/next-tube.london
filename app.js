'use strict';

var express = require('express');
var app = express();
var async = require('async');
var socket = require('socket.io');
var http = require('http');

var deepClone = require('underscore.deepclone');

var POLL_INTERVAL = 5000000;

var nextTrain = require('./fetchers/next-train/next-train.js');

// requests always served from the cache and then updated over websockets.
var cache = {"nextBus":{"1":{"direction":"Woodford Bridge and Barkingside","buses":[{"to":"Woodford Bridge and Barkingside","due":"6"}]},"2":{"direction":"Woodford Green","buses":[{"to":"Woodford Green","due":"9"}]},"1413707922290":{"direction":"1.0","buses":[]}},"tflStatus":[{"ID":0,"StatusDetails":"No service between Queens Park and Harrow & Wealdstone due to planned engineering work. Good service on the rest of the line.","BranchDisruptions":{"BranchDisruption":{"StationTo":{"ID":100,"Name":"Harrow & Wealdstone"},"StationFrom":{"ID":183,"Name":"Queen's Park"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}}},"Line":{"ID":1,"Name":"Bakerloo"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":1,"StatusDetails":"No service between White City and Ealing Broadway/ West Ruislip due to planned engineering work. Good service on the rest of the line.","BranchDisruptions":{"BranchDisruption":[{"StationTo":{"ID":61,"Name":"Ealing Broadway"},"StationFrom":{"ID":266,"Name":"White City"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"StationTo":{"ID":263,"Name":"West Ruislip"},"StationFrom":{"ID":266,"Name":"White City"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}}]},"Line":{"ID":2,"Name":"Central"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":10,"StatusDetails":"","BranchDisruptions":{},"Line":{"ID":7,"Name":"Circle"},"Status":{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":2,"StatusDetails":"No service between Barking and Upminster, and between Turnham Green and Richmond due to planned engineering work. Good service on the rest of the line.","BranchDisruptions":{"BranchDisruption":[{"StationTo":{"ID":190,"Name":"Richmond"},"StationFrom":{"ID":238,"Name":"Turnham Green"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"StationTo":{"ID":240,"Name":"Upminster"},"StationFrom":{"ID":14,"Name":"Barking"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}}]},"Line":{"ID":9,"Name":"District"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":8,"StatusDetails":"","BranchDisruptions":{},"Line":{"ID":8,"Name":"Hammersmith and City"},"Status":{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":4,"StatusDetails":"No service between Waterloo and Finchley Road until 1100 due to planned engineering work. Good service on the rest of the line.","BranchDisruptions":{"BranchDisruption":{"StationTo":{"ID":81,"Name":"Finchley Road"},"StationFrom":{"ID":252,"Name":"Waterloo"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}}},"Line":{"ID":4,"Name":"Jubilee"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":9,"StatusDetails":"","BranchDisruptions":{},"Line":{"ID":11,"Name":"Metropolitan"},"Status":{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":5,"StatusDetails":"","BranchDisruptions":{},"Line":{"ID":5,"Name":"Northern"},"Status":{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":6,"StatusDetails":"","BranchDisruptions":{},"Line":{"ID":6,"Name":"Piccadilly"},"Status":{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":7,"StatusDetails":"","BranchDisruptions":{},"Line":{"ID":3,"Name":"Victoria"},"Status":{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":11,"StatusDetails":"Train service resumes at 0615 on Monday.","BranchDisruptions":{},"Line":{"ID":12,"Name":"Waterloo and City"},"Status":{"ID":"SC","CssClass":"GoodService","Description":"Service Closed","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":82,"StatusDetails":"No service between Gospel Oak and Barking while we fix a signalling problem at South Tottenham. Tickets will be accepted on London Underground services via any reasonable route.\nNo service between Camden Road and Richmond, and between Queens Park and Watford Junction due to planned engineering work. Good service on all other routes.","BranchDisruptions":{"BranchDisruption":[{"StationTo":{"ID":14,"Name":"Barking"},"StationFrom":{"ID":318,"Name":"Gospel Oak"},"Status":{"ID":"PS","CssClass":"DisruptedService","Description":"Part Suspended","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"StationTo":{"ID":365,"Name":"Watford Junction"},"StationFrom":{"ID":183,"Name":"Queen's Park"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"StationTo":{"ID":190,"Name":"Richmond"},"StationFrom":{"ID":299,"Name":"Camden Road"},"Status":{"ID":"PC","CssClass":"DisruptedService","Description":"Part Closure","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}}]},"Line":{"ID":82,"Name":"Overground"},"Status":{"ID":"PS","CssClass":"DisruptedService","Description":"Part Suspended","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}},{"ID":81,"StatusDetails":"","BranchDisruptions":{},"Line":{"ID":81,"Name":"DLR"},"Status":{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":true,"StatusType":{"ID":1,"Description":"Line"}}}],"nextTrain":{"stationCodes":{"BNK":"Bank","BDE":"Barkingside","BNG":"Bethnal Green","BDS":"Bond Street","BHL":"Buckhurst Hill","CYL":"Chancery Lane","CHG":"Chigwell","DEB":"Debden","EBY":"Ealing Broadway","EAC":"East Acton","EPP":"Epping","FLP":"Fairlop","GHL":"Gants Hill","GRH":"Grange Hill","GFD":"Greenford","HAI":"Hainault","HLN":"Hanger Lane","HOL":"Holborn","HPK":"Holland Park","LAN":"Lancaster Gate","LEY":"Leyton","LYS":"Leytonstone","LST":"Liverpool Street","LTN":"Loughton","MAR":"Marble Arch","MLE":"Mile End","NEP":"Newbury Park","NAC":"North Acton","NHT":"Northolt","NHG":"Notting Hill Gate","OXC":"Oxford Circus","PER":"Perivale","QWY":"Queensway","RED":"Redbridge","ROD":"Roding Valley","RUG":"Ruislip Gardens","SBC":"Shepherds Bush (Central Line)","SNB":"Snaresbrook","SRP":"South Ruislip","SWF":"South Woodford","STP":"St Pauls","SFD":"Stratford","THB":"Theydon Bois","TCR":"Tottenham Court Road","WAN":"Wanstead","WAC":"West Acton","WRP":"West Ruislip","WCT":"White City","WFD":"Woodford"},"stations":{"WFD":{"code":"WFD","name":"Woodford.","trains":{"Westbound":[{"dueIn":"6:00","destination":"White City","isStalled":false,"location":"Between Loughton and Buckhurst Hill"},{"dueIn":"13:00","destination":"White City","isStalled":false,"location":"Between Theydon Bois and Debden"},{"dueIn":"19:00","destination":"White City","isStalled":false,"location":"At Epping"},{"dueIn":"19:00","destination":"White City","isStalled":false,"location":"At Epping"},{"dueIn":"20:00","destination":"Woodford Via Hainault","isStalled":false,"location":"At Newbury Park"}],"Eastbound":[{"dueIn":"6:00","destination":"Epping","isStalled":false,"location":"Between Leytonstone and Snaresbrook"},{"dueIn":"12:00","destination":"Epping","isStalled":false,"location":"Between Stratford and Leyton"},{"dueIn":"13:00","destination":"Epping","isStalled":false,"location":"At Stratford"},{"dueIn":"27:00","destination":"Epping","isStalled":false,"location":"Between St. Paul's and Bank"}]}}}}};

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: require('./fetchers/tfl-status.js'),
        nextTrain: nextTrain.getAll.bind(null, io),
        nextBus: require('./fetchers/next-bus.js')
    };
    async.parallel(methods, function (error, data) {
        callback(null, data);
    });
}


 /**
 * Notify connected clients that there is a new value.
 */
function notifyAllClients(widget, data) {
    io.emit(widget, data);
}

// check all feeds
setInterval(function () {
    fetchAllWidgetData(function (es, ds) {
        for (var widget in cache) {
            if (widget === 'nextTrain') {
                nextTrain.checkForChanges(ds, cache, function(stationId, newData) {
                    io.emit('next-train:station:' + stationId, newData);
                });
            } else {
                if (JSON.stringify(cache[widget]) !== JSON.stringify(ds[widget])) {
                    notifyAllClients(widget, ds[widget]);
                }
            }
        }
        cache = ds;
    });
}, POLL_INTERVAL);

app.use(express.static('public'));

app.get('/', function (req, res) {
    if (req.query.data === 'true') {
        return res.json(cache);
    }

    cache.tubes = {
        currentStationCode: "WFD"
    }
    res.render('layout.jade', cache);
});

var getStationData = function(stationCode, callback) {
    if (cache.nextTrain[stationCode]) {
        callback(null, cache.nextTrain[stationCode]);
    } else {
        nextTrain.get(stationCode, function(e, d) {
            cache.nextTrain[stationCode] = d;
            callback(e, d);
        });
    }
};


var urlCodes = require('./fetchers/next-train/url-codes.json');

app.get('/central-line/:station', function (req, res) {

    var stationCode = urlCodes[req.params.station];

    if(!stationCode) {
        return res.send(404);
    }
    console.log('station lookup', stationCode);
    getStationData(stationCode, function (err, data) {
        console.log('gotback', err, data);
        var send = cache;
        send.tubes = {
            currentStationCode: stationCode
        };

        if (req.headers.accept === 'application/json') {
            res.json(data);
        } else {
            res.render('layout.jade', send);
        }
    });
});

var server = http.createServer(app);
var port =  process.env.PORT || 4000;

// on startup get the latest data.
fetchAllWidgetData(function (errorSet, dataSet) {
    cache = dataSet;
});

server.listen(port, function () {
    console.log('Listening on ' + port);
});

var io = socket.listen(server);

io.sockets.on('connection', function (socket) {
    Object.keys(nextTrain.events).forEach(function (ev) {
        socket.on(ev, nextTrain.events[ev].bind(null, socket));
    });
});
