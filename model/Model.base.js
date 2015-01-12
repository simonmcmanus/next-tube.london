

// // take models, provides a cache wrapper
// // and ensure they are polled regularly
// var async = require('async');


// //var changePath = require('../changePath/index');



// var base = module.exports = function(models, interval) {
//     var self = this;
//     self.models = models;
//     setInterval(function () {
//         self.fetch(function (es, ds) {
//             for (var station in ds.nextTrain.stations) {
//                 var changes = changePath(station,  cache.nextTrain.stations[station], ds.nextTrain.stations[station]);
//                 if(changes.length > 0) {
//                     io.emit('station:' + station + ':change', changes);
//                 }
//             }
//             cache = ds;
//         });
//     }, interval);
// };

// base.prototype.fetch = function() {
//     Object.keys(this.models).forEach(function(model) {
//         model.fetch();
//     });
// }

