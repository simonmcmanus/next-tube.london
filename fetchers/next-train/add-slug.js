var out = [];
var fs = require('fs');

var file = './components/station-switcher/lib/all-stations.json'

var lines = {
    B: 'bakerloo',
    C: 'central',
    D: 'district',
    H: 'hammersmith-and-circle',
    J: 'jubilee',
    M: 'metropolitan',
    N: 'northern',
    P: 'piccadilly',
    V: 'victoria',
    W: 'waterloo-and-city'
};
 

var stations = require('../.' +  file);
var out = stations.map(function(station) {
    station.slug = lines[station.lines[0]] + '/' + station.slug
    return station;
});

console.log(JSON.stringify(out, null, 4));
// fs.writeFile(file, JSON.stringify(out, null, 4), 'utf8', function(e, d) {
//     console.log(e)
// })
