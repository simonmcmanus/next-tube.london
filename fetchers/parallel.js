'use strict';

var _ = require('underscore');
/**

    Parallel implementation that runs all callbacks, if errors are found they
    are returned in the data object.

 * @param  {Object}   gets     { dog: function(done) { done(null, true) },
 *                               cat: function(done) { done(true) }}
 * @param  {Function} callback(data)
 *                             data: { dog: true, cat: { error: true }}
 */
module.exports = function (gets, callback) {

    if (_.isEmpty(gets)) {
        return callback(null, gets);
    }

    var counter = 0;
    var out = {};
    var buildOutput = function (property, error, data) {
        counter++;
        if (error) {
            out[property] = { error: error };
        }else {
            out[property] = data;
        }

        if (counter === totalGets) {
            callback(out);
        }
    };

    for (var property in gets) {
        if (gets.hasOwnProperty(property)) {
            var totalGets = Object.keys(gets).length;
            gets[property](buildOutput.bind(null, property));
        }
    }
};
