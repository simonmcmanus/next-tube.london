(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
var nextBus = require('../components/next-bus/next-bus.js');
var nextTrain = require('../components/next-train/next-train.js');
var trainStatus = require('../components/train-status/train-status.js');


if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
}else {
    url = 'http://localhost/'
}
socket = io(url);

// need to implement nextTrain:central:woodford

//socket.on('nextTrain', nextTrain.render);
socket.on('trainStatus', trainStatus.render);
socket.on('nextBus', nextBus.render);

nextTrain.bind($('#nextTrain'));
//trainStatus.bind($('#tflStatus'));
//nextBus.bind($('#nextBus'));


}, {"../components/next-bus/next-bus.js":2,"../components/next-train/next-train.js":3,"../components/train-status/train-status.js":4}],
2: [function(require, module, exports) {
var template = require('./next-bus.jade');

exports.render = function(data) {
    $('#nextBus').replaceWith(template({ 'nextBus': data }));
};

}, {"./next-bus.jade":5}],
5: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (nextBus) {
buf.push("<div id=\"nextBus\" class=\"widget wide\"><h2>Buses</h2><div class=\"direction\"><h3>To Barkingside</h3><ul class=\"trains\">");
if ( nextBus['1'])
{
// iterate nextBus['1'].buses
;(function(){
  var $$obj = nextBus['1'].buses;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var bus = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = bus.due) ? "" : jade_interp)) + "</span></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var bus = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = bus.due) ? "" : jade_interp)) + "</span></div></li>");
    }

  }
}).call(this);

}
buf.push("</ul></div><div class=\"direction\"><h3>To Walthamstow</h3><ul class=\"trains\">");
if ( nextBus['2'])
{
// iterate nextBus['2'].buses
;(function(){
  var $$obj = nextBus['2'].buses;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var bus = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = bus.due) ? "" : jade_interp)) + "</span></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var bus = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = bus.due) ? "" : jade_interp)) + "</span></div></li>");
    }

  }
}).call(this);

}
buf.push("</ul></div></div>");}.call(this,"nextBus" in locals_for_with?locals_for_with.nextBus:typeof nextBus!=="undefined"?nextBus:undefined));;return buf.join("");
};
}, {"jade-runtime":6}],
6: [function(require, module, exports) {
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || _dereq_('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(_dereq_,module,exports){

},{}]},{},[1])
(1)
});
}, {}],
3: [function(require, module, exports) {
var template = require('./next-train.jade');

exports.render = function(data) {
    var $newNode = $(template({ 'nextTrain': data}));
    $('#nextTrain').replaceWith($newNode);
    exports.bind($newNode, data);
};

exports.bind = function($node, data) {
    var $select = $node.find('select#stationCode');
    $select.change(stationChange);
    $node.find('a.change').click(function() {
        $node.find('.settings').toggleClass('hidden');
    });
    var newStation = $select.data('currentlyListening');
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('nextTrain:central:' + newStation, exports.render);
};

var stationChange = function(e) {
    var oldStation = e.currentTarget.dataset['currentlyListening'];
    var newStation = e.currentTarget.selectedOptions[0].value;
    socket.off('nextTrain:central:' + oldStation);
    socket.emit('next-train:station:listen:stop', oldStation);
    getStationData(newStation);
};

var getStationData = function(stationCode, callback) {
    $.get('/next-train/central/' + stationCode, function(data, success) {
        if(success !== 'success') {
            return alert('Connection failed');
        }
        // strip out other instances, should happen on the server. 
        var stations = {};
        stations[stationCode] = data.stations[stationCode];
        data.stations = stations;
        exports.render(data);
    });
};
}, {"./next-train.jade":7}],
7: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (nextTrain) {
// iterate nextTrain.stations
;(function(){
  var $$obj = nextTrain.stations;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var station = $$obj[$index];

buf.push("<div id=\"nextTrain\" class=\"widget wide\"><h2>" + (jade.escape(null == (jade_interp = 'Trains from ' + station.name) ? "" : jade_interp)) + "</h2><a href=\"#\" class=\"change\">Settings</a><div class=\"settings\"><form method=\"get\" action=\"/\"><label for=\"lineCode\">Line:</label><select name=\"lineCode\" id=\"lineCode\"" + (jade.attr("data-currently-listening", station.code, true, false)) + ">");
// iterate nextTrain.lineCodes
;(function(){
  var $$obj = nextTrain.lineCodes;
  if ('number' == typeof $$obj.length) {

    for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
      var lineCode = $$obj[id];

buf.push("<option" + (jade.attr("value", id, true, false)) + ">" + (jade.escape(null == (jade_interp = lineCode) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var id in $$obj) {
      $$l++;      var lineCode = $$obj[id];

buf.push("<option" + (jade.attr("value", id, true, false)) + ">" + (jade.escape(null == (jade_interp = lineCode) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><br/><label for=\"stationCode\">Station:</label><select name=\"stationCode\" id=\"stationCode\"" + (jade.attr("data-currently-listening", station.code, true, false)) + ">");
// iterate nextTrain.stationCodes
;(function(){
  var $$obj = nextTrain.stationCodes;
  if ('number' == typeof $$obj.length) {

    for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
      var stationCode = $$obj[id];

var selected = false;
if ( station.code === id)
{
selected = true
}
buf.push("<option" + (jade.attr("value", id, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = stationCode) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var id in $$obj) {
      $$l++;      var stationCode = $$obj[id];

var selected = false;
if ( station.code === id)
{
selected = true
}
buf.push("<option" + (jade.attr("value", id, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = stationCode) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></form></div>");
var noTrains = true;
// iterate station.trains
;(function(){
  var $$obj = station.trains;
  if ('number' == typeof $$obj.length) {

    for (var direction = 0, $$l = $$obj.length; direction < $$l; direction++) {
      var trains = $$obj[direction];

if ( trains.length > 0)
{
buf.push("<div class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = direction) ? "" : jade_interp)) + "</h3><ul class=\"trains\">");
// iterate trains
;(function(){
  var $$obj = trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  }
}).call(this);

buf.push("</ul></div>");
noTrains = false;
}
    }

  } else {
    var $$l = 0;
    for (var direction in $$obj) {
      $$l++;      var trains = $$obj[direction];

if ( trains.length > 0)
{
buf.push("<div class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = direction) ? "" : jade_interp)) + "</h3><ul class=\"trains\">");
// iterate trains
;(function(){
  var $$obj = trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  }
}).call(this);

buf.push("</ul></div>");
noTrains = false;
}
    }

  }
}).call(this);

if ( noTrains)
{
buf.push("<h3 class=\"noTrains\">No Trains</h3>");
}
buf.push("</div>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var station = $$obj[$index];

buf.push("<div id=\"nextTrain\" class=\"widget wide\"><h2>" + (jade.escape(null == (jade_interp = 'Trains from ' + station.name) ? "" : jade_interp)) + "</h2><a href=\"#\" class=\"change\">Settings</a><div class=\"settings\"><form method=\"get\" action=\"/\"><label for=\"lineCode\">Line:</label><select name=\"lineCode\" id=\"lineCode\"" + (jade.attr("data-currently-listening", station.code, true, false)) + ">");
// iterate nextTrain.lineCodes
;(function(){
  var $$obj = nextTrain.lineCodes;
  if ('number' == typeof $$obj.length) {

    for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
      var lineCode = $$obj[id];

buf.push("<option" + (jade.attr("value", id, true, false)) + ">" + (jade.escape(null == (jade_interp = lineCode) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var id in $$obj) {
      $$l++;      var lineCode = $$obj[id];

buf.push("<option" + (jade.attr("value", id, true, false)) + ">" + (jade.escape(null == (jade_interp = lineCode) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><br/><label for=\"stationCode\">Station:</label><select name=\"stationCode\" id=\"stationCode\"" + (jade.attr("data-currently-listening", station.code, true, false)) + ">");
// iterate nextTrain.stationCodes
;(function(){
  var $$obj = nextTrain.stationCodes;
  if ('number' == typeof $$obj.length) {

    for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
      var stationCode = $$obj[id];

var selected = false;
if ( station.code === id)
{
selected = true
}
buf.push("<option" + (jade.attr("value", id, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = stationCode) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var id in $$obj) {
      $$l++;      var stationCode = $$obj[id];

var selected = false;
if ( station.code === id)
{
selected = true
}
buf.push("<option" + (jade.attr("value", id, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = stationCode) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></form></div>");
var noTrains = true;
// iterate station.trains
;(function(){
  var $$obj = station.trains;
  if ('number' == typeof $$obj.length) {

    for (var direction = 0, $$l = $$obj.length; direction < $$l; direction++) {
      var trains = $$obj[direction];

if ( trains.length > 0)
{
buf.push("<div class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = direction) ? "" : jade_interp)) + "</h3><ul class=\"trains\">");
// iterate trains
;(function(){
  var $$obj = trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  }
}).call(this);

buf.push("</ul></div>");
noTrains = false;
}
    }

  } else {
    var $$l = 0;
    for (var direction in $$obj) {
      $$l++;      var trains = $$obj[direction];

if ( trains.length > 0)
{
buf.push("<div class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = direction) ? "" : jade_interp)) + "</h3><ul class=\"trains\">");
// iterate trains
;(function(){
  var $$obj = trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  }
}).call(this);

buf.push("</ul></div>");
noTrains = false;
}
    }

  }
}).call(this);

if ( noTrains)
{
buf.push("<h3 class=\"noTrains\">No Trains</h3>");
}
buf.push("</div>");
    }

  }
}).call(this);
}.call(this,"nextTrain" in locals_for_with?locals_for_with.nextTrain:typeof nextTrain!=="undefined"?nextTrain:undefined));;return buf.join("");
};
}, {"jade-runtime":6}],
4: [function(require, module, exports) {
var template = require('./train-status.jade');

exports.render = function(data) {
    $('#tflStatus').replaceWith(template({'tflStatus': data}));
};


}, {"./train-status.jade":8}],
8: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (count, tflStatus, RegExp) {
buf.push("<div id=\"tflStatus\" class=\"widget wide\"><h2>Tube Status</h2><ul>");
count = 0;
// iterate tflStatus
;(function(){
  var $$obj = tflStatus;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var status = $$obj[$index];

if ( status.StatusDetails!=='')
{
var regex = new RegExp(' ', "g")
buf.push("<li" + (jade.cls(['line '+status.Line.Name.replace(regex, '')], [true])) + "><h3>" + (jade.escape(null == (jade_interp = status.Line.Name) ? "" : jade_interp)) + "</h3><div>" + (jade.escape(null == (jade_interp = status.StatusDetails) ? "" : jade_interp)) + "</div>");
count++
buf.push("</li>");
}
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var status = $$obj[$index];

if ( status.StatusDetails!=='')
{
var regex = new RegExp(' ', "g")
buf.push("<li" + (jade.cls(['line '+status.Line.Name.replace(regex, '')], [true])) + "><h3>" + (jade.escape(null == (jade_interp = status.Line.Name) ? "" : jade_interp)) + "</h3><div>" + (jade.escape(null == (jade_interp = status.StatusDetails) ? "" : jade_interp)) + "</div>");
count++
buf.push("</li>");
}
    }

  }
}).call(this);

if ( count === 0)
{
buf.push("<div>All lines operational.</div>");
}
buf.push("</ul></div>");}.call(this,"count" in locals_for_with?locals_for_with.count:typeof count!=="undefined"?count:undefined,"tflStatus" in locals_for_with?locals_for_with.tflStatus:typeof tflStatus!=="undefined"?tflStatus:undefined,"RegExp" in locals_for_with?locals_for_with.RegExp:typeof RegExp!=="undefined"?RegExp:undefined));;return buf.join("");
};
}, {"jade-runtime":6}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVpcmUuanMiLCJjbGllbnQvc2hhcmVkLmpzIiwiY29tcG9uZW50cy9uZXh0LWJ1cy9uZXh0LWJ1cy5qcyIsImNvbXBvbmVudHMvbmV4dC1idXMvbmV4dC1idXMuamFkZSIsImphZGUtcnVudGltZSIsImNvbXBvbmVudHMvbmV4dC10cmFpbi9uZXh0LXRyYWluLmpzIiwiY29tcG9uZW50cy9uZXh0LXRyYWluL25leHQtdHJhaW4uamFkZSIsImNvbXBvbmVudHMvdHJhaW4tc3RhdHVzL3RyYWluLXN0YXR1cy5qcyIsImNvbXBvbmVudHMvdHJhaW4tc3RhdHVzL3RyYWluLXN0YXR1cy5qYWRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDalRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIG91dGVyKG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKXtcblxuICAvKipcbiAgICogR2xvYmFsXG4gICAqL1xuXG4gIHZhciBnbG9iYWwgPSAoZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pKCk7XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYG5hbWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGp1bXBlZFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiByZXF1aXJlKG5hbWUsIGp1bXBlZCl7XG4gICAgaWYgKGNhY2hlW25hbWVdKSByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICBpZiAobW9kdWxlc1tuYW1lXSkgcmV0dXJuIGNhbGwobmFtZSwgcmVxdWlyZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgZmluZCBtb2R1bGUgXCInICsgbmFtZSArICdcIicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgbW9kdWxlIGBpZGAgYW5kIGNhY2hlIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcmVxdWlyZVxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGwoaWQsIHJlcXVpcmUpe1xuICAgIHZhciBtID0gY2FjaGVbaWRdID0geyBleHBvcnRzOiB7fSB9O1xuICAgIHZhciBtb2QgPSBtb2R1bGVzW2lkXTtcbiAgICB2YXIgbmFtZSA9IG1vZFsyXTtcbiAgICB2YXIgZm4gPSBtb2RbMF07XG5cbiAgICBmbi5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24ocmVxKXtcbiAgICAgIHZhciBkZXAgPSBtb2R1bGVzW2lkXVsxXVtyZXFdO1xuICAgICAgcmV0dXJuIHJlcXVpcmUoZGVwID8gZGVwIDogcmVxKTtcbiAgICB9LCBtLCBtLmV4cG9ydHMsIG91dGVyLCBtb2R1bGVzLCBjYWNoZSwgZW50cmllcyk7XG5cbiAgICAvLyBleHBvc2UgYXMgYG5hbWVgLlxuICAgIGlmIChuYW1lKSBjYWNoZVtuYW1lXSA9IGNhY2hlW2lkXTtcblxuICAgIHJldHVybiBjYWNoZVtpZF0uZXhwb3J0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1aXJlIGFsbCBlbnRyaWVzIGV4cG9zaW5nIHRoZW0gb24gZ2xvYmFsIGlmIG5lZWRlZC5cbiAgICovXG5cbiAgZm9yICh2YXIgaWQgaW4gZW50cmllcykge1xuICAgIGlmIChlbnRyaWVzW2lkXSkge1xuICAgICAgZ2xvYmFsW2VudHJpZXNbaWRdXSA9IHJlcXVpcmUoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1aXJlKGlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHVvIGZsYWcuXG4gICAqL1xuXG4gIHJlcXVpcmUuZHVvID0gdHJ1ZTtcblxuICAvKipcbiAgICogRXhwb3NlIGNhY2hlLlxuICAgKi9cblxuICByZXF1aXJlLmNhY2hlID0gY2FjaGU7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBtb2R1bGVzXG4gICAqL1xuXG4gIHJlcXVpcmUubW9kdWxlcyA9IG1vZHVsZXM7XG5cbiAgLyoqXG4gICAqIFJldHVybiBuZXdlc3QgcmVxdWlyZS5cbiAgICovXG5cbiAgIHJldHVybiByZXF1aXJlO1xufSkiLCJ2YXIgbmV4dEJ1cyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvbmV4dC1idXMvbmV4dC1idXMuanMnKTtcbnZhciBuZXh0VHJhaW4gPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL25leHQtdHJhaW4vbmV4dC10cmFpbi5qcycpO1xudmFyIHRyYWluU3RhdHVzID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy90cmFpbi1zdGF0dXMvdHJhaW4tc3RhdHVzLmpzJyk7XG5cblxuaWYod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSAnd29vZGZvcmQudG9kYXknKSB7XG4gICAgdXJsID0gJ2h0dHA6Ly93b29kZm9yZC50b2RheTo4MC8nO1xufWVsc2Uge1xuICAgIHVybCA9ICdodHRwOi8vbG9jYWxob3N0Lydcbn1cbnNvY2tldCA9IGlvKHVybCk7XG5cbi8vIG5lZWQgdG8gaW1wbGVtZW50IG5leHRUcmFpbjpjZW50cmFsOndvb2Rmb3JkXG5cbi8vc29ja2V0Lm9uKCduZXh0VHJhaW4nLCBuZXh0VHJhaW4ucmVuZGVyKTtcbnNvY2tldC5vbigndHJhaW5TdGF0dXMnLCB0cmFpblN0YXR1cy5yZW5kZXIpO1xuc29ja2V0Lm9uKCduZXh0QnVzJywgbmV4dEJ1cy5yZW5kZXIpO1xuXG5uZXh0VHJhaW4uYmluZCgkKCcjbmV4dFRyYWluJykpO1xuLy90cmFpblN0YXR1cy5iaW5kKCQoJyN0ZmxTdGF0dXMnKSk7XG4vL25leHRCdXMuYmluZCgkKCcjbmV4dEJ1cycpKTtcblxuIiwidmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9uZXh0LWJ1cy5qYWRlJyk7XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICQoJyNuZXh0QnVzJykucmVwbGFjZVdpdGgodGVtcGxhdGUoeyAnbmV4dEJ1cyc6IGRhdGEgfSkpO1xufTtcbiIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS1ydW50aW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChuZXh0QnVzKSB7XG5idWYucHVzaChcIjxkaXYgaWQ9XFxcIm5leHRCdXNcXFwiIGNsYXNzPVxcXCJ3aWRnZXQgd2lkZVxcXCI+PGgyPkJ1c2VzPC9oMj48ZGl2IGNsYXNzPVxcXCJkaXJlY3Rpb25cXFwiPjxoMz5UbyBCYXJraW5nc2lkZTwvaDM+PHVsIGNsYXNzPVxcXCJ0cmFpbnNcXFwiPlwiKTtcbmlmICggbmV4dEJ1c1snMSddKVxue1xuLy8gaXRlcmF0ZSBuZXh0QnVzWycxJ10uYnVzZXNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbmV4dEJ1c1snMSddLmJ1c2VzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgJGluZGV4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyAkaW5kZXggPCAkJGw7ICRpbmRleCsrKSB7XG4gICAgICB2YXIgYnVzID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBidXMuZHVlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgYnVzID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBidXMuZHVlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj48ZGl2IGNsYXNzPVxcXCJkaXJlY3Rpb25cXFwiPjxoMz5UbyBXYWx0aGFtc3RvdzwvaDM+PHVsIGNsYXNzPVxcXCJ0cmFpbnNcXFwiPlwiKTtcbmlmICggbmV4dEJ1c1snMiddKVxue1xuLy8gaXRlcmF0ZSBuZXh0QnVzWycyJ10uYnVzZXNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbmV4dEJ1c1snMiddLmJ1c2VzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgJGluZGV4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyAkaW5kZXggPCAkJGw7ICRpbmRleCsrKSB7XG4gICAgICB2YXIgYnVzID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBidXMuZHVlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgYnVzID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBidXMuZHVlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJuZXh0QnVzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5uZXh0QnVzOnR5cGVvZiBuZXh0QnVzIT09XCJ1bmRlZmluZWRcIj9uZXh0QnVzOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsIiFmdW5jdGlvbihlKXtpZihcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyltb2R1bGUuZXhwb3J0cz1lKCk7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKGUpO2Vsc2V7dmFyIGY7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz9mPXdpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2Y9Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmJiYoZj1zZWxmKSxmLmphZGU9ZSgpfX0oZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXHJcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXHJcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XHJcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IGFcclxuICogQHBhcmFtIHtPYmplY3R9IGJcclxuICogQHJldHVybiB7T2JqZWN0fSBhXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XHJcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcclxuICAgIHZhciBhdHRycyA9IGFbMF07XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXR0cnM7XHJcbiAgfVxyXG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XHJcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcclxuXHJcbiAgaWYgKGFjIHx8IGJjKSB7XHJcbiAgICBhYyA9IGFjIHx8IFtdO1xyXG4gICAgYmMgPSBiYyB8fCBbXTtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcclxuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBrZXkgaW4gYikge1xyXG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XHJcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBhO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWxcclxuICogQHJldHVybiB7Qm9vbGVhbn1cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gbnVsbHModmFsKSB7XHJcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcclxuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XHJcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpLmZpbHRlcihudWxscykuam9pbignICcpIDogdmFsO1xyXG59XHJcblxyXG4vKipcclxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXHJcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcclxuICB2YXIgYnVmID0gW107XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XHJcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcclxuICAgIH1cclxuICB9XHJcbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xyXG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xyXG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJztcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcclxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcclxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xyXG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xyXG4gICAgaWYgKHZhbCkge1xyXG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XHJcbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xyXG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xyXG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xyXG4gIHZhciBidWYgPSBbXTtcclxuXHJcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xyXG5cclxuICBpZiAoa2V5cy5sZW5ndGgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxyXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XHJcblxyXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcclxuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xyXG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoaHRtbCl7XHJcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKVxyXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XHJcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcclxuICBlbHNlIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vKipcclxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXHJcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XHJcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XHJcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xyXG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XHJcbiAgICB0aHJvdyBlcnI7XHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICBzdHIgPSBzdHIgfHwgX2RlcmVxXygnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcclxuICB9IGNhdGNoIChleCkge1xyXG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcclxuICB9XHJcbiAgdmFyIGNvbnRleHQgPSAzXHJcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxyXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXHJcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XHJcblxyXG4gIC8vIEVycm9yIGNvbnRleHRcclxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcclxuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcclxuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXHJcbiAgICAgICsgY3VyclxyXG4gICAgICArICd8ICdcclxuICAgICAgKyBsaW5lO1xyXG4gIH0pLmpvaW4oJ1xcbicpO1xyXG5cclxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxyXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XHJcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xyXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xyXG4gIHRocm93IGVycjtcclxufTtcclxuXG59LHtcImZzXCI6Mn1dLDI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XX0se30sWzFdKVxuKDEpXG59KTsiLCJ2YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL25leHQtdHJhaW4uamFkZScpO1xuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgJG5ld05vZGUgPSAkKHRlbXBsYXRlKHsgJ25leHRUcmFpbic6IGRhdGF9KSk7XG4gICAgJCgnI25leHRUcmFpbicpLnJlcGxhY2VXaXRoKCRuZXdOb2RlKTtcbiAgICBleHBvcnRzLmJpbmQoJG5ld05vZGUsIGRhdGEpO1xufTtcblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oJG5vZGUsIGRhdGEpIHtcbiAgICB2YXIgJHNlbGVjdCA9ICRub2RlLmZpbmQoJ3NlbGVjdCNzdGF0aW9uQ29kZScpO1xuICAgICRzZWxlY3QuY2hhbmdlKHN0YXRpb25DaGFuZ2UpO1xuICAgICRub2RlLmZpbmQoJ2EuY2hhbmdlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICRub2RlLmZpbmQoJy5zZXR0aW5ncycpLnRvZ2dsZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9KTtcbiAgICB2YXIgbmV3U3RhdGlvbiA9ICRzZWxlY3QuZGF0YSgnY3VycmVudGx5TGlzdGVuaW5nJyk7XG4gICAgc29ja2V0LmVtaXQoJ25leHQtdHJhaW46c3RhdGlvbjpsaXN0ZW46c3RhcnQnLCBuZXdTdGF0aW9uKTtcbiAgICBzb2NrZXQub24oJ25leHRUcmFpbjpjZW50cmFsOicgKyBuZXdTdGF0aW9uLCBleHBvcnRzLnJlbmRlcik7XG59O1xuXG52YXIgc3RhdGlvbkNoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgb2xkU3RhdGlvbiA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0WydjdXJyZW50bHlMaXN0ZW5pbmcnXTtcbiAgICB2YXIgbmV3U3RhdGlvbiA9IGUuY3VycmVudFRhcmdldC5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG4gICAgc29ja2V0Lm9mZignbmV4dFRyYWluOmNlbnRyYWw6JyArIG9sZFN0YXRpb24pO1xuICAgIHNvY2tldC5lbWl0KCduZXh0LXRyYWluOnN0YXRpb246bGlzdGVuOnN0b3AnLCBvbGRTdGF0aW9uKTtcbiAgICBnZXRTdGF0aW9uRGF0YShuZXdTdGF0aW9uKTtcbn07XG5cbnZhciBnZXRTdGF0aW9uRGF0YSA9IGZ1bmN0aW9uKHN0YXRpb25Db2RlLCBjYWxsYmFjaykge1xuICAgICQuZ2V0KCcvbmV4dC10cmFpbi9jZW50cmFsLycgKyBzdGF0aW9uQ29kZSwgZnVuY3Rpb24oZGF0YSwgc3VjY2Vzcykge1xuICAgICAgICBpZihzdWNjZXNzICE9PSAnc3VjY2VzcycpIHtcbiAgICAgICAgICAgIHJldHVybiBhbGVydCgnQ29ubmVjdGlvbiBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdHJpcCBvdXQgb3RoZXIgaW5zdGFuY2VzLCBzaG91bGQgaGFwcGVuIG9uIHRoZSBzZXJ2ZXIuIFxuICAgICAgICB2YXIgc3RhdGlvbnMgPSB7fTtcbiAgICAgICAgc3RhdGlvbnNbc3RhdGlvbkNvZGVdID0gZGF0YS5zdGF0aW9uc1tzdGF0aW9uQ29kZV07XG4gICAgICAgIGRhdGEuc3RhdGlvbnMgPSBzdGF0aW9ucztcbiAgICAgICAgZXhwb3J0cy5yZW5kZXIoZGF0YSk7XG4gICAgfSk7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS1ydW50aW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChuZXh0VHJhaW4pIHtcbi8vIGl0ZXJhdGUgbmV4dFRyYWluLnN0YXRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG5leHRUcmFpbi5zdGF0aW9ucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIHN0YXRpb24gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxkaXYgaWQ9XFxcIm5leHRUcmFpblxcXCIgY2xhc3M9XFxcIndpZGdldCB3aWRlXFxcIj48aDI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSAnVHJhaW5zIGZyb20gJyArIHN0YXRpb24ubmFtZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMj48YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiY2hhbmdlXFxcIj5TZXR0aW5nczwvYT48ZGl2IGNsYXNzPVxcXCJzZXR0aW5nc1xcXCI+PGZvcm0gbWV0aG9kPVxcXCJnZXRcXFwiIGFjdGlvbj1cXFwiL1xcXCI+PGxhYmVsIGZvcj1cXFwibGluZUNvZGVcXFwiPkxpbmU6PC9sYWJlbD48c2VsZWN0IG5hbWU9XFxcImxpbmVDb2RlXFxcIiBpZD1cXFwibGluZUNvZGVcXFwiXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1jdXJyZW50bHktbGlzdGVuaW5nXCIsIHN0YXRpb24uY29kZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiKTtcbi8vIGl0ZXJhdGUgbmV4dFRyYWluLmxpbmVDb2Rlc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBuZXh0VHJhaW4ubGluZUNvZGVzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWQgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkIDwgJCRsOyBpZCsrKSB7XG4gICAgICB2YXIgbGluZUNvZGUgPSAkJG9ialtpZF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBsaW5lQ29kZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkIGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgbGluZUNvZGUgPSAkJG9ialtpZF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBsaW5lQ29kZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0Pjxici8+PGxhYmVsIGZvcj1cXFwic3RhdGlvbkNvZGVcXFwiPlN0YXRpb246PC9sYWJlbD48c2VsZWN0IG5hbWU9XFxcInN0YXRpb25Db2RlXFxcIiBpZD1cXFwic3RhdGlvbkNvZGVcXFwiXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1jdXJyZW50bHktbGlzdGVuaW5nXCIsIHN0YXRpb24uY29kZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiKTtcbi8vIGl0ZXJhdGUgbmV4dFRyYWluLnN0YXRpb25Db2Rlc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBuZXh0VHJhaW4uc3RhdGlvbkNvZGVzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWQgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkIDwgJCRsOyBpZCsrKSB7XG4gICAgICB2YXIgc3RhdGlvbkNvZGUgPSAkJG9ialtpZF07XG5cbnZhciBzZWxlY3RlZCA9IGZhbHNlO1xuaWYgKCBzdGF0aW9uLmNvZGUgPT09IGlkKVxue1xuc2VsZWN0ZWQgPSB0cnVlXG59XG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCBzZWxlY3RlZCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc3RhdGlvbkNvZGUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHN0YXRpb25Db2RlID0gJCRvYmpbaWRdO1xuXG52YXIgc2VsZWN0ZWQgPSBmYWxzZTtcbmlmICggc3RhdGlvbi5jb2RlID09PSBpZClcbntcbnNlbGVjdGVkID0gdHJ1ZVxufVxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgc2VsZWN0ZWQsIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHN0YXRpb25Db2RlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9mb3JtPjwvZGl2PlwiKTtcbnZhciBub1RyYWlucyA9IHRydWU7XG4vLyBpdGVyYXRlIHN0YXRpb24udHJhaW5zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHN0YXRpb24udHJhaW5zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgZGlyZWN0aW9uID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBkaXJlY3Rpb24gPCAkJGw7IGRpcmVjdGlvbisrKSB7XG4gICAgICB2YXIgdHJhaW5zID0gJCRvYmpbZGlyZWN0aW9uXTtcblxuaWYgKCB0cmFpbnMubGVuZ3RoID4gMClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwiZGlyZWN0aW9uXFxcIj48aDM+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBkaXJlY3Rpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvaDM+PHVsIGNsYXNzPVxcXCJ0cmFpbnNcXFwiPlwiKTtcbi8vIGl0ZXJhdGUgdHJhaW5zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHRyYWlucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIHRyYWluID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kdWVJbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJkZXN0aW5hdGlvblxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kZXN0aW5hdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj5cIik7XG5ub1RyYWlucyA9IGZhbHNlO1xufVxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGRpcmVjdGlvbiBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHRyYWlucyA9ICQkb2JqW2RpcmVjdGlvbl07XG5cbmlmICggdHJhaW5zLmxlbmd0aCA+IDApXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImRpcmVjdGlvblxcXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZGlyZWN0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG4vLyBpdGVyYXRlIHRyYWluc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSB0cmFpbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PHNwYW4gY2xhc3M9XFxcImRldGFpbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5sb2NhdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvdWw+PC9kaXY+XCIpO1xubm9UcmFpbnMgPSBmYWxzZTtcbn1cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuaWYgKCBub1RyYWlucylcbntcbmJ1Zi5wdXNoKFwiPGgzIGNsYXNzPVxcXCJub1RyYWluc1xcXCI+Tm8gVHJhaW5zPC9oMz5cIik7XG59XG5idWYucHVzaChcIjwvZGl2PlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBzdGF0aW9uID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8ZGl2IGlkPVxcXCJuZXh0VHJhaW5cXFwiIGNsYXNzPVxcXCJ3aWRnZXQgd2lkZVxcXCI+PGgyPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gJ1RyYWlucyBmcm9tICcgKyBzdGF0aW9uLm5hbWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvaDI+PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcImNoYW5nZVxcXCI+U2V0dGluZ3M8L2E+PGRpdiBjbGFzcz1cXFwic2V0dGluZ3NcXFwiPjxmb3JtIG1ldGhvZD1cXFwiZ2V0XFxcIiBhY3Rpb249XFxcIi9cXFwiPjxsYWJlbCBmb3I9XFxcImxpbmVDb2RlXFxcIj5MaW5lOjwvbGFiZWw+PHNlbGVjdCBuYW1lPVxcXCJsaW5lQ29kZVxcXCIgaWQ9XFxcImxpbmVDb2RlXFxcIlwiICsgKGphZGUuYXR0cihcImRhdGEtY3VycmVudGx5LWxpc3RlbmluZ1wiLCBzdGF0aW9uLmNvZGUsIHRydWUsIGZhbHNlKSkgKyBcIj5cIik7XG4vLyBpdGVyYXRlIG5leHRUcmFpbi5saW5lQ29kZXNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbmV4dFRyYWluLmxpbmVDb2RlcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZCA8ICQkbDsgaWQrKykge1xuICAgICAgdmFyIGxpbmVDb2RlID0gJCRvYmpbaWRdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gbGluZUNvZGUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGxpbmVDb2RlID0gJCRvYmpbaWRdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gbGluZUNvZGUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3NlbGVjdD48YnIvPjxsYWJlbCBmb3I9XFxcInN0YXRpb25Db2RlXFxcIj5TdGF0aW9uOjwvbGFiZWw+PHNlbGVjdCBuYW1lPVxcXCJzdGF0aW9uQ29kZVxcXCIgaWQ9XFxcInN0YXRpb25Db2RlXFxcIlwiICsgKGphZGUuYXR0cihcImRhdGEtY3VycmVudGx5LWxpc3RlbmluZ1wiLCBzdGF0aW9uLmNvZGUsIHRydWUsIGZhbHNlKSkgKyBcIj5cIik7XG4vLyBpdGVyYXRlIG5leHRUcmFpbi5zdGF0aW9uQ29kZXNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbmV4dFRyYWluLnN0YXRpb25Db2RlcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZCA8ICQkbDsgaWQrKykge1xuICAgICAgdmFyIHN0YXRpb25Db2RlID0gJCRvYmpbaWRdO1xuXG52YXIgc2VsZWN0ZWQgPSBmYWxzZTtcbmlmICggc3RhdGlvbi5jb2RlID09PSBpZClcbntcbnNlbGVjdGVkID0gdHJ1ZVxufVxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgc2VsZWN0ZWQsIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHN0YXRpb25Db2RlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWQgaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBzdGF0aW9uQ29kZSA9ICQkb2JqW2lkXTtcblxudmFyIHNlbGVjdGVkID0gZmFsc2U7XG5pZiAoIHN0YXRpb24uY29kZSA9PT0gaWQpXG57XG5zZWxlY3RlZCA9IHRydWVcbn1cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsIHNlbGVjdGVkLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0aW9uQ29kZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PjwvZm9ybT48L2Rpdj5cIik7XG52YXIgbm9UcmFpbnMgPSB0cnVlO1xuLy8gaXRlcmF0ZSBzdGF0aW9uLnRyYWluc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzdGF0aW9uLnRyYWlucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGRpcmVjdGlvbiA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZGlyZWN0aW9uIDwgJCRsOyBkaXJlY3Rpb24rKykge1xuICAgICAgdmFyIHRyYWlucyA9ICQkb2JqW2RpcmVjdGlvbl07XG5cbmlmICggdHJhaW5zLmxlbmd0aCA+IDApXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImRpcmVjdGlvblxcXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZGlyZWN0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG4vLyBpdGVyYXRlIHRyYWluc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSB0cmFpbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PHNwYW4gY2xhc3M9XFxcImRldGFpbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5sb2NhdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvdWw+PC9kaXY+XCIpO1xubm9UcmFpbnMgPSBmYWxzZTtcbn1cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBkaXJlY3Rpb24gaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciB0cmFpbnMgPSAkJG9ialtkaXJlY3Rpb25dO1xuXG5pZiAoIHRyYWlucy5sZW5ndGggPiAwKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJkaXJlY3Rpb25cXFwiPjxoMz5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGRpcmVjdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48dWwgY2xhc3M9XFxcInRyYWluc1xcXCI+XCIpO1xuLy8gaXRlcmF0ZSB0cmFpbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gdHJhaW5zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgJGluZGV4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyAkaW5kZXggPCAkJGw7ICRpbmRleCsrKSB7XG4gICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PHNwYW4gY2xhc3M9XFxcImRldGFpbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5sb2NhdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHRyYWluID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kdWVJbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJkZXN0aW5hdGlvblxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kZXN0aW5hdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PlwiKTtcbm5vVHJhaW5zID0gZmFsc2U7XG59XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmlmICggbm9UcmFpbnMpXG57XG5idWYucHVzaChcIjxoMyBjbGFzcz1cXFwibm9UcmFpbnNcXFwiPk5vIFRyYWluczwvaDM+XCIpO1xufVxuYnVmLnB1c2goXCI8L2Rpdj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG59LmNhbGwodGhpcyxcIm5leHRUcmFpblwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubmV4dFRyYWluOnR5cGVvZiBuZXh0VHJhaW4hPT1cInVuZGVmaW5lZFwiP25leHRUcmFpbjp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RyYWluLXN0YXR1cy5qYWRlJyk7XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICQoJyN0ZmxTdGF0dXMnKS5yZXBsYWNlV2l0aCh0ZW1wbGF0ZSh7J3RmbFN0YXR1cyc6IGRhdGF9KSk7XG59O1xuXG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUtcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY291bnQsIHRmbFN0YXR1cywgUmVnRXhwKSB7XG5idWYucHVzaChcIjxkaXYgaWQ9XFxcInRmbFN0YXR1c1xcXCIgY2xhc3M9XFxcIndpZGdldCB3aWRlXFxcIj48aDI+VHViZSBTdGF0dXM8L2gyPjx1bD5cIik7XG5jb3VudCA9IDA7XG4vLyBpdGVyYXRlIHRmbFN0YXR1c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSB0ZmxTdGF0dXM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciBzdGF0dXMgPSAkJG9ialskaW5kZXhdO1xuXG5pZiAoIHN0YXR1cy5TdGF0dXNEZXRhaWxzIT09JycpXG57XG52YXIgcmVnZXggPSBuZXcgUmVnRXhwKCcgJywgXCJnXCIpXG5idWYucHVzaChcIjxsaVwiICsgKGphZGUuY2xzKFsnbGluZSAnK3N0YXR1cy5MaW5lLk5hbWUucmVwbGFjZShyZWdleCwgJycpXSwgW3RydWVdKSkgKyBcIj48aDM+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0dXMuTGluZS5OYW1lKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjxkaXY+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0dXMuU3RhdHVzRGV0YWlscykgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9kaXY+XCIpO1xuY291bnQrK1xuYnVmLnB1c2goXCI8L2xpPlwiKTtcbn1cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBzdGF0dXMgPSAkJG9ialskaW5kZXhdO1xuXG5pZiAoIHN0YXR1cy5TdGF0dXNEZXRhaWxzIT09JycpXG57XG52YXIgcmVnZXggPSBuZXcgUmVnRXhwKCcgJywgXCJnXCIpXG5idWYucHVzaChcIjxsaVwiICsgKGphZGUuY2xzKFsnbGluZSAnK3N0YXR1cy5MaW5lLk5hbWUucmVwbGFjZShyZWdleCwgJycpXSwgW3RydWVdKSkgKyBcIj48aDM+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0dXMuTGluZS5OYW1lKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjxkaXY+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0dXMuU3RhdHVzRGV0YWlscykgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9kaXY+XCIpO1xuY291bnQrK1xuYnVmLnB1c2goXCI8L2xpPlwiKTtcbn1cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuaWYgKCBjb3VudCA9PT0gMClcbntcbmJ1Zi5wdXNoKFwiPGRpdj5BbGwgbGluZXMgb3BlcmF0aW9uYWwuPC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImNvdW50XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jb3VudDp0eXBlb2YgY291bnQhPT1cInVuZGVmaW5lZFwiP2NvdW50OnVuZGVmaW5lZCxcInRmbFN0YXR1c1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudGZsU3RhdHVzOnR5cGVvZiB0ZmxTdGF0dXMhPT1cInVuZGVmaW5lZFwiP3RmbFN0YXR1czp1bmRlZmluZWQsXCJSZWdFeHBcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLlJlZ0V4cDp0eXBlb2YgUmVnRXhwIT09XCJ1bmRlZmluZWRcIj9SZWdFeHA6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07Il19