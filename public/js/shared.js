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
var socket = io(url);

socket.on('nextTrain', nextTrain.render);
socket.on('trainStatus', trainStatus.render);
socket.on('nextBus', nextBus.render);


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
    console.log(data);
    $('#nextTrain').replaceWith(template({ 'nextTrain': data}));
};


}, {"./next-train.jade":7}],
7: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (nextTrain) {
buf.push("<div id=\"nextTrain\" class=\"widget wide\"><h2>Trains from Woodford</h2><div class=\"value\"><div class=\"settings\"><select>");
// iterate nextTrain.stations
;(function(){
  var $$obj = nextTrain.stations;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var station = $$obj[$index];

buf.push("<option" + (jade.attr("value", station.code, true, false)) + ">" + (jade.escape(null == (jade_interp = station.name) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var station = $$obj[$index];

buf.push("<option" + (jade.attr("value", station.code, true, false)) + ">" + (jade.escape(null == (jade_interp = station.name) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div>");
// iterate nextTrain.station[nextTrain.current].trains
;(function(){
  var $$obj = nextTrain.station[nextTrain.current].trains;
  if ('number' == typeof $$obj.length) {

    for (var direction = 0, $$l = $$obj.length; direction < $$l; direction++) {
      var trains = $$obj[direction];

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
    }

  } else {
    var $$l = 0;
    for (var direction in $$obj) {
      $$l++;      var trains = $$obj[direction];

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
    }

  }
}).call(this);

buf.push("</div></div>");}.call(this,"nextTrain" in locals_for_with?locals_for_with.nextTrain:typeof nextTrain!=="undefined"?nextTrain:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (count, tflStatus) {
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
buf.push("<li" + (jade.cls(['line '+status.Line.Name.replace(' ', '')], [true])) + "><h3>" + (jade.escape(null == (jade_interp = status.Line.Name) ? "" : jade_interp)) + "</h3><div>" + (jade.escape(null == (jade_interp = status.StatusDetails) ? "" : jade_interp)) + "</div>");
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
buf.push("<li" + (jade.cls(['line '+status.Line.Name.replace(' ', '')], [true])) + "><h3>" + (jade.escape(null == (jade_interp = status.Line.Name) ? "" : jade_interp)) + "</h3><div>" + (jade.escape(null == (jade_interp = status.StatusDetails) ? "" : jade_interp)) + "</div>");
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
buf.push("</ul></div>");}.call(this,"count" in locals_for_with?locals_for_with.count:typeof count!=="undefined"?count:undefined,"tflStatus" in locals_for_with?locals_for_with.tflStatus:typeof tflStatus!=="undefined"?tflStatus:undefined));;return buf.join("");
};
}, {"jade-runtime":6}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVpcmUuanMiLCJjbGllbnQvc2hhcmVkLmpzIiwiY29tcG9uZW50cy9uZXh0LWJ1cy9uZXh0LWJ1cy5qcyIsImNvbXBvbmVudHMvbmV4dC1idXMvbmV4dC1idXMuamFkZSIsImphZGUtcnVudGltZSIsImNvbXBvbmVudHMvbmV4dC10cmFpbi9uZXh0LXRyYWluLmpzIiwiY29tcG9uZW50cy9uZXh0LXRyYWluL25leHQtdHJhaW4uamFkZSIsImNvbXBvbmVudHMvdHJhaW4tc3RhdHVzL3RyYWluLXN0YXR1cy5qcyIsImNvbXBvbmVudHMvdHJhaW4tc3RhdHVzL3RyYWluLXN0YXR1cy5qYWRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIG91dGVyKG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKXtcblxuICAvKipcbiAgICogR2xvYmFsXG4gICAqL1xuXG4gIHZhciBnbG9iYWwgPSAoZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pKCk7XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYG5hbWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGp1bXBlZFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiByZXF1aXJlKG5hbWUsIGp1bXBlZCl7XG4gICAgaWYgKGNhY2hlW25hbWVdKSByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICBpZiAobW9kdWxlc1tuYW1lXSkgcmV0dXJuIGNhbGwobmFtZSwgcmVxdWlyZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgZmluZCBtb2R1bGUgXCInICsgbmFtZSArICdcIicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgbW9kdWxlIGBpZGAgYW5kIGNhY2hlIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcmVxdWlyZVxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGwoaWQsIHJlcXVpcmUpe1xuICAgIHZhciBtID0gY2FjaGVbaWRdID0geyBleHBvcnRzOiB7fSB9O1xuICAgIHZhciBtb2QgPSBtb2R1bGVzW2lkXTtcbiAgICB2YXIgbmFtZSA9IG1vZFsyXTtcbiAgICB2YXIgZm4gPSBtb2RbMF07XG5cbiAgICBmbi5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24ocmVxKXtcbiAgICAgIHZhciBkZXAgPSBtb2R1bGVzW2lkXVsxXVtyZXFdO1xuICAgICAgcmV0dXJuIHJlcXVpcmUoZGVwID8gZGVwIDogcmVxKTtcbiAgICB9LCBtLCBtLmV4cG9ydHMsIG91dGVyLCBtb2R1bGVzLCBjYWNoZSwgZW50cmllcyk7XG5cbiAgICAvLyBleHBvc2UgYXMgYG5hbWVgLlxuICAgIGlmIChuYW1lKSBjYWNoZVtuYW1lXSA9IGNhY2hlW2lkXTtcblxuICAgIHJldHVybiBjYWNoZVtpZF0uZXhwb3J0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1aXJlIGFsbCBlbnRyaWVzIGV4cG9zaW5nIHRoZW0gb24gZ2xvYmFsIGlmIG5lZWRlZC5cbiAgICovXG5cbiAgZm9yICh2YXIgaWQgaW4gZW50cmllcykge1xuICAgIGlmIChlbnRyaWVzW2lkXSkge1xuICAgICAgZ2xvYmFsW2VudHJpZXNbaWRdXSA9IHJlcXVpcmUoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1aXJlKGlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHVvIGZsYWcuXG4gICAqL1xuXG4gIHJlcXVpcmUuZHVvID0gdHJ1ZTtcblxuICAvKipcbiAgICogRXhwb3NlIGNhY2hlLlxuICAgKi9cblxuICByZXF1aXJlLmNhY2hlID0gY2FjaGU7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBtb2R1bGVzXG4gICAqL1xuXG4gIHJlcXVpcmUubW9kdWxlcyA9IG1vZHVsZXM7XG5cbiAgLyoqXG4gICAqIFJldHVybiBuZXdlc3QgcmVxdWlyZS5cbiAgICovXG5cbiAgIHJldHVybiByZXF1aXJlO1xufSkiLCJ2YXIgbmV4dEJ1cyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvbmV4dC1idXMvbmV4dC1idXMuanMnKTtcbnZhciBuZXh0VHJhaW4gPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL25leHQtdHJhaW4vbmV4dC10cmFpbi5qcycpO1xudmFyIHRyYWluU3RhdHVzID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy90cmFpbi1zdGF0dXMvdHJhaW4tc3RhdHVzLmpzJyk7XG5cblxuaWYod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSAnd29vZGZvcmQudG9kYXknKSB7XG4gICAgdXJsID0gJ2h0dHA6Ly93b29kZm9yZC50b2RheTo4MC8nO1xufWVsc2Uge1xuICAgIHVybCA9ICdodHRwOi8vbG9jYWxob3N0Lydcbn1cbnZhciBzb2NrZXQgPSBpbyh1cmwpO1xuXG5zb2NrZXQub24oJ25leHRUcmFpbicsIG5leHRUcmFpbi5yZW5kZXIpO1xuc29ja2V0Lm9uKCd0cmFpblN0YXR1cycsIHRyYWluU3RhdHVzLnJlbmRlcik7XG5zb2NrZXQub24oJ25leHRCdXMnLCBuZXh0QnVzLnJlbmRlcik7XG5cbiIsInZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vbmV4dC1idXMuamFkZScpO1xuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAkKCcjbmV4dEJ1cycpLnJlcGxhY2VXaXRoKHRlbXBsYXRlKHsgJ25leHRCdXMnOiBkYXRhIH0pKTtcbn07XG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUtcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobmV4dEJ1cykge1xuYnVmLnB1c2goXCI8ZGl2IGlkPVxcXCJuZXh0QnVzXFxcIiBjbGFzcz1cXFwid2lkZ2V0IHdpZGVcXFwiPjxoMj5CdXNlczwvaDI+PGRpdiBjbGFzcz1cXFwiZGlyZWN0aW9uXFxcIj48aDM+VG8gQmFya2luZ3NpZGU8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG5pZiAoIG5leHRCdXNbJzEnXSlcbntcbi8vIGl0ZXJhdGUgbmV4dEJ1c1snMSddLmJ1c2VzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG5leHRCdXNbJzEnXS5idXNlcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cXFwiZGlyZWN0aW9uXFxcIj48aDM+VG8gV2FsdGhhbXN0b3c8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG5pZiAoIG5leHRCdXNbJzInXSlcbntcbi8vIGl0ZXJhdGUgbmV4dEJ1c1snMiddLmJ1c2VzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG5leHRCdXNbJzInXS5idXNlcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PC9kaXY+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwibmV4dEJ1c1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubmV4dEJ1czp0eXBlb2YgbmV4dEJ1cyE9PVwidW5kZWZpbmVkXCI/bmV4dEJ1czp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCIhZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShlKTtlbHNle3ZhciBmO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/Zj13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9mPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKGY9c2VsZiksZi5qYWRlPWUoKX19KGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxyXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxyXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxyXG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXHJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xyXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF0dHJzO1xyXG4gIH1cclxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xyXG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XHJcblxyXG4gIGlmIChhYyB8fCBiYykge1xyXG4gICAgYWMgPSBhYyB8fCBbXTtcclxuICAgIGJjID0gYmMgfHwgW107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XHJcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIga2V5IGluIGIpIHtcclxuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xyXG4gICAgICBhW2tleV0gPSBiW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xyXG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xyXG59XHJcblxyXG4vKipcclxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XHJcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xyXG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKSA6IHZhbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cclxuICpcclxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xyXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XHJcbiAgdmFyIGJ1ZiA9IFtdO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xyXG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcclxuICBpZiAodGV4dC5sZW5ndGgpIHtcclxuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcclxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcclxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcclxuICAgIGlmICh2YWwpIHtcclxuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xyXG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcclxuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcclxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcclxuICB2YXIgYnVmID0gW107XHJcblxyXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcclxuXHJcbiAgaWYgKGtleXMubGVuZ3RoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGtleSA9IGtleXNbaV1cclxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xyXG5cclxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XHJcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcclxuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBidWYuam9pbignJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xyXG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbClcclxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xyXG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XHJcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxyXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cclxuICpcclxuICogQHBhcmFtIHtFcnJvcn0gZXJyXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xyXG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xyXG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcclxuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xyXG4gICAgdGhyb3cgZXJyO1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgc3RyID0gc3RyIHx8IF9kZXJlcV8oJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXHJcbiAgfSBjYXRjaCAoZXgpIHtcclxuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXHJcbiAgfVxyXG4gIHZhciBjb250ZXh0ID0gM1xyXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcclxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxyXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xyXG5cclxuICAvLyBFcnJvciBjb250ZXh0XHJcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XHJcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XHJcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxyXG4gICAgICArIGN1cnJcclxuICAgICAgKyAnfCAnXHJcbiAgICAgICsgbGluZTtcclxuICB9KS5qb2luKCdcXG4nKTtcclxuXHJcbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcclxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xyXG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cclxuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcclxuICB0aHJvdyBlcnI7XHJcbn07XHJcblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSlcbigxKVxufSk7IiwidmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9uZXh0LXRyYWluLmphZGUnKTtcblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgJCgnI25leHRUcmFpbicpLnJlcGxhY2VXaXRoKHRlbXBsYXRlKHsgJ25leHRUcmFpbic6IGRhdGF9KSk7XG59O1xuXG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUtcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobmV4dFRyYWluKSB7XG5idWYucHVzaChcIjxkaXYgaWQ9XFxcIm5leHRUcmFpblxcXCIgY2xhc3M9XFxcIndpZGdldCB3aWRlXFxcIj48aDI+VHJhaW5zIGZyb20gV29vZGZvcmQ8L2gyPjxkaXYgY2xhc3M9XFxcInZhbHVlXFxcIj48ZGl2IGNsYXNzPVxcXCJzZXR0aW5nc1xcXCI+PHNlbGVjdD5cIik7XG4vLyBpdGVyYXRlIG5leHRUcmFpbi5zdGF0aW9uc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBuZXh0VHJhaW4uc3RhdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciBzdGF0aW9uID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgc3RhdGlvbi5jb2RlLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0aW9uLm5hbWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBzdGF0aW9uID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgc3RhdGlvbi5jb2RlLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0aW9uLm5hbWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3NlbGVjdD48L2Rpdj5cIik7XG4vLyBpdGVyYXRlIG5leHRUcmFpbi5zdGF0aW9uW25leHRUcmFpbi5jdXJyZW50XS50cmFpbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbmV4dFRyYWluLnN0YXRpb25bbmV4dFRyYWluLmN1cnJlbnRdLnRyYWlucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGRpcmVjdGlvbiA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZGlyZWN0aW9uIDwgJCRsOyBkaXJlY3Rpb24rKykge1xuICAgICAgdmFyIHRyYWlucyA9ICQkb2JqW2RpcmVjdGlvbl07XG5cbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwiZGlyZWN0aW9uXFxcIj48aDM+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBkaXJlY3Rpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvaDM+PHVsIGNsYXNzPVxcXCJ0cmFpbnNcXFwiPlwiKTtcbi8vIGl0ZXJhdGUgdHJhaW5zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHRyYWlucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIHRyYWluID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kdWVJbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJkZXN0aW5hdGlvblxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kZXN0aW5hdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgZGlyZWN0aW9uIGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgdHJhaW5zID0gJCRvYmpbZGlyZWN0aW9uXTtcblxuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJkaXJlY3Rpb25cXFwiPjxoMz5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGRpcmVjdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48dWwgY2xhc3M9XFxcInRyYWluc1xcXCI+XCIpO1xuLy8gaXRlcmF0ZSB0cmFpbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gdHJhaW5zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgJGluZGV4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyAkaW5kZXggPCAkJGw7ICRpbmRleCsrKSB7XG4gICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PHNwYW4gY2xhc3M9XFxcImRldGFpbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5sb2NhdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHRyYWluID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kdWVJbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJkZXN0aW5hdGlvblxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kZXN0aW5hdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L2Rpdj48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJuZXh0VHJhaW5cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm5leHRUcmFpbjp0eXBlb2YgbmV4dFRyYWluIT09XCJ1bmRlZmluZWRcIj9uZXh0VHJhaW46dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90cmFpbi1zdGF0dXMuamFkZScpO1xuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAkKCcjdGZsU3RhdHVzJykucmVwbGFjZVdpdGgodGVtcGxhdGUoeyd0ZmxTdGF0dXMnOiBkYXRhfSkpO1xufTtcblxuIiwidmFyIGphZGUgPSByZXF1aXJlKCdqYWRlLXJ1bnRpbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNvdW50LCB0ZmxTdGF0dXMpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBpZD1cXFwidGZsU3RhdHVzXFxcIiBjbGFzcz1cXFwid2lkZ2V0IHdpZGVcXFwiPjxoMj5UdWJlIFN0YXR1czwvaDI+PHVsPlwiKTtcbmNvdW50ID0gMDtcbi8vIGl0ZXJhdGUgdGZsU3RhdHVzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHRmbFN0YXR1cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIHN0YXR1cyA9ICQkb2JqWyRpbmRleF07XG5cbmlmICggc3RhdHVzLlN0YXR1c0RldGFpbHMhPT0nJylcbntcbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoWydsaW5lICcrc3RhdHVzLkxpbmUuTmFtZS5yZXBsYWNlKCcgJywgJycpXSwgW3RydWVdKSkgKyBcIj48aDM+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0dXMuTGluZS5OYW1lKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjxkaXY+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzdGF0dXMuU3RhdHVzRGV0YWlscykgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9kaXY+XCIpO1xuY291bnQrK1xuYnVmLnB1c2goXCI8L2xpPlwiKTtcbn1cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBzdGF0dXMgPSAkJG9ialskaW5kZXhdO1xuXG5pZiAoIHN0YXR1cy5TdGF0dXNEZXRhaWxzIT09JycpXG57XG5idWYucHVzaChcIjxsaVwiICsgKGphZGUuY2xzKFsnbGluZSAnK3N0YXR1cy5MaW5lLk5hbWUucmVwbGFjZSgnICcsICcnKV0sIFt0cnVlXSkpICsgXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc3RhdHVzLkxpbmUuTmFtZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48ZGl2PlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc3RhdHVzLlN0YXR1c0RldGFpbHMpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvZGl2PlwiKTtcbmNvdW50KytcbmJ1Zi5wdXNoKFwiPC9saT5cIik7XG59XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmlmICggY291bnQgPT09IDApXG57XG5idWYucHVzaChcIjxkaXY+QWxsIGxpbmVzIG9wZXJhdGlvbmFsLjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJjb3VudFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY291bnQ6dHlwZW9mIGNvdW50IT09XCJ1bmRlZmluZWRcIj9jb3VudDp1bmRlZmluZWQsXCJ0ZmxTdGF0dXNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnRmbFN0YXR1czp0eXBlb2YgdGZsU3RhdHVzIT09XCJ1bmRlZmluZWRcIj90ZmxTdGF0dXM6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07Il19