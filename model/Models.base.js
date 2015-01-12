'use strict';

// // take models, provides a cache wrapper
// and ensure they are polled regularly
var async = require('async');

/**
 * Fetches muliple models at a set interval
 * @param  {object} models   {station: {get: function(){}, getAll:..}}}
 * @param  {number} interval time in miliseconds between updates.
 */
var base = module.exports = function(models, io, interval) {
    var self = this;
    self.models = models;
    fetch(self.models, io, function() {});
    setInterval(function () {
        fetch(self.models, io, function() {});
    }, interval);
    return self.models;
};

/**
 * Calls getAll method on each model
 * @param  {Object}   models   {station: {get: function(){}, getAll:..}}}
 * @param  {Function} callback When all model data collected.
 */
function fetch(models, io, callback) {
    async.map(Object.keys(models), function(model, next) {
        models[model].getAll(io, next);
    }, callback);
}