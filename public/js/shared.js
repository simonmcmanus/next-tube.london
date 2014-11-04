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

var page = require('../public/libs/page.js');
var nextBus = require('../components/next-bus/next-bus.js');
var nextTrain = require('../components/next-train/next-train.js');
var trainStatus = require('../components/train-status/train-status.js');

var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
}else {
    url = 'http://localhost/';
}
var socket = io(url);

nextTrain.bind($('#nextTrain'), socket);

socket.on('trainStatus', trainStatus.render);
socket.on('nextBus', nextBus.render);

page();

var stationCodes = require('../fetchers/next-train/url-codes.json');


// we need to know what the old  station name was here. 
// 
// does this route always get hit on change?
page('/central-line/:stationName', function(context, next) {
    var code = stationCodes[context.params.stationName];
    $('li a.point').removeClass('point');
    $('#map-container').attr('data-station', code);
    var selector = 'ul.line li.' + code + ' a';
    $(selector).addClass('point');
    nextTrain.showLoader();
    nextTrain.getStationData(context.params.stationName, socket);
});

// $(' ul#central.line li a').click(function(e) {
//     e.preventDefault();
//     var newStation = this.href.split('/').pop();
//     $('#map-container').attr('data-station', newStation);
//     nextTrain.getStationData(newStation, socket);
// });

}, {"../public/libs/page.js":2,"../components/next-bus/next-bus.js":3,"../components/next-train/next-train.js":4,"../components/train-status/train-status.js":5,"../fetchers/next-train/url-codes.json":6}],
2: [function(require, module, exports) {
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.page=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

  /* jshint browser:true */

  /**
   * Module dependencies.
   */

  var pathtoRegexp = _dereq_('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' == typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' == typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
    // show <path> with [state]
    } else if ('string' == typeof path) {
      page.show(path, fn);
    // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path){
    if (0 == arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) window.addEventListener('click', onclick, false);
    if (!dispatch) return;
    var url = location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function(){
    running = false;
    removeEventListener('click', onclick, false);
    removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch){
    var ctx = new Context(path, state);
    if (false !== dispatch) page.dispatch(ctx);
    if (!ctx.unhandled) ctx.pushState();
    return ctx;
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */

  page.replace = function(path, state, init, dispatch){
    var ctx = new Context(path, state);
    ctx.init = init;
    if (null == dispatch) dispatch = true;
    if (dispatch) page.dispatch(ctx);
    ctx.save();
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx){
    var i = 0;

    function next() {
      var fn = page.callbacks[i++];
      if (!fn) return unhandled(ctx);
      fn(ctx, next);
    }

    next();
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    var current = window.location.pathname + window.location.search;
    if (current == ctx.canonicalPath) return;
    page.stop();
    ctx.unhandled = true;
    window.location = ctx.canonicalPath;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? path.slice(i + 1) : '';
    this.pathname = ~i ? path.slice(0, i) : path;
    this.params = [];

    // fragment
    this.hash = '';
    if (!~this.path.indexOf('#')) return;
    var parts = this.path.split('#');
    this.path = parts[0];
    this.hash = parts[1] || '';
    this.querystring = this.querystring.split('#')[0];
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function(){
    history.pushState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function(){
    history.replaceState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path
      , this.keys = []
      , options.sensitive
      , options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn){
    var self = this;
    return function(ctx, next){
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Array} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params){
    var keys = this.keys
      , qsIndex = path.indexOf('?')
      , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
      , m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];

      var val = 'string' == typeof m[i]
        ? decodeURIComponent(m[i])
        : m[i];

      if (key) {
        params[key.name] = undefined !== params[key.name]
          ? params[key.name]
          : val;
      } else {
        params.push(val);
      }
    }

    return true;
  };

  /**
   * Handle "populate" events.
   */

  function onpopstate(e) {
    if (e.state) {
      var path = e.state.path;
      page.replace(path, e.state);
    }
  }

  /**
   * Handle "click" events.
   */

  function onclick(e) {
    if (1 != which(e)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    var el = e.target;
    while (el && 'A' != el.nodeName) el = el.parentNode;
    if (!el || 'A' != el.nodeName) return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

    // Check for mailto: in the href
    if (link.indexOf("mailto:") > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;

    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // same page
    var orig = path + el.hash;

    path = path.replace(base, '');
    if (base && orig == path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null == e.which
      ? e.button
      : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return 0 == href.indexOf(origin);
  }

},{"path-to-regexp":2}],2:[function(_dereq_,module,exports){
/**
 * Expose `pathtoRegexp`.
 */
module.exports = pathtoRegexp;

var PATH_REGEXP = new RegExp([
  // Match already escaped characters that would otherwise incorrectly appear
  // in future matches. This allows the user to escape special characters that
  // shouldn't be transformed.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that should always be escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array should be passed in, which will contain the placeholder key
 * names. For example `/user/:id` will then contain `["id"]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 keys
 * @param  {Object}                options
 * @return {RegExp}
 */
function pathtoRegexp (path, keys, options) {
  keys = keys || [];
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var index = 0;

  if (path instanceof RegExp) {
    // Match all capturing groups of a regexp.
    var groups = path.source.match(/\((?!\?)/g) || [];

    // Map all the matches to their numeric keys and push into the keys.
    keys.push.apply(keys, groups.map(function (match, index) {
      return {
        name:      index,
        delimiter: null,
        optional:  false,
        repeat:    false
      };
    }));

    // Return the source back to the user.
    return path;
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    // Generate a new regexp instance by joining all the parts together.
    return new RegExp('(?:' + path.join('|') + ')', flags);
  }

  // Alter the path string into a usable regexp.
  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
    // Avoiding re-escaping escaped characters.
    if (escaped) {
      return escaped;
    }

    // Escape regexp special characters.
    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    // Escape the prefix character.
    prefix = prefix ? '\\' + prefix : '';

    // Match using the custom capturing group, or fallback to capturing
    // everything up to the next slash (or next period if the param was
    // prefixed with a period).
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    // Allow parameters to be repeated more than once.
    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    // Allow a parameter to be optional.
    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  });

  // Check whether the path ends in a slash as it alters some match behaviour.
  var endsWithSlash = path[path.length - 1] === '/';

  // In non-strict mode we allow an optional trailing slash in the match. If
  // the path to match already ended with a slash, we need to remove it for
  // consistency. The slash is only valid at the very end of a path match, not
  // anywhere in the middle. This is important for non-ending mode, otherwise
  // "/test/" will match "/test//route".
  if (!strict) {
    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
  }

  // In non-ending mode, we need prompt the capturing groups to match as much
  // as possible by using a positive lookahead for the end or next path segment.
  if (!end) {
    path += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return new RegExp('^' + path + (end ? '$' : ''), flags);
};

},{}]},{},[1])
(1)
});

}, {}],
3: [function(require, module, exports) {
var template = require('./next-bus.jade');

exports.render = function(data) {
    $('#nextBus').replaceWith(template({ 'nextBus': data }));
};

}, {"./next-bus.jade":7}],
7: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (nextBus) {
buf.push("<div id=\"nextBus\"><h2>Buses</h2><div class=\"direction\"><h3>To Barkingside</h3><ul class=\"trains\">");
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
}, {"jade-runtime":8}],
8: [function(require, module, exports) {
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
4: [function(require, module, exports) {
'use strict';

var page = require('../../public/libs/page.js');
var templateTrains = require('./trains.jade');
var templateTitle = require('./title.jade');

var listen = function (newStation, socket) {
    console.log('listen', newStation);
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('next-train:station:' + newStation, exports.render);
};

exports.getStationData = function (stationCode, socket) {

    $.ajax({
        url: '/central-line/' + stationCode,
        headers: {
            Accept: 'application/json'
        },
        success: function (data) {
            //$('.widget').removeClass('loading');
            exports.render(data);
            $('#floater').height($('.container').height());
            setTimeout(function() {
                $('#floater').removeClass('loading');
            }, 600);
            listen(data.code, socket);
        }
    }).fail(function (e) {
        $('#floater .trains').html('<h2>Sorry</h2><p>Error occured fetching ' + stationCode + '</p>');
    });
};

exports.routeChange = function() {

};

var stationChange = function (socket, e) {
    var oldStation = e.currentTarget.dataset.currentlyListening;
    var newStation = e.currentTarget.selectedOptions[0].value;
    var newStationSlug = e.currentTarget.selectedOptions[0].label.replace(/ /g, '-').toLowerCase();
    page('/central-line/' + newStationSlug);

    console.log('stop listening.', oldStation);
    socket.emit('next-train:station:listen:stop', oldStation);
    socket.off('next-train:station:' + oldStation);
    exports.getStationData(newStationSlug, socket);
};

exports.showLoader = function() {
    $('#floater').addClass('loading');
};

exports.render = function (data) {
    var $node = $('#nextTrain');
    $node.find('select').attr('data-currently-listening', data.code);
    $('select').val(data.code);
    //$('body').scrollTop(0);
    $node.find('.trains').replaceWith($(templateTrains({ station: data })));
};

exports.bind = function ($node, socket) {
    var $select = $node.find('select#stationCode');
    $select.change(stationChange.bind(null, socket));
    var newStation = $select.data('currentlyListening');
    listen(newStation, socket);
};

}, {"../../public/libs/page.js":2,"./trains.jade":9,"./title.jade":10}],
9: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (station) {
buf.push("<div class=\"trains\">");
var noTrains = true;
if ( station)
{
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

}
if ( noTrains)
{
buf.push("<h3 class=\"noTrains\">No Trains</h3>");
}
buf.push("</div>");}.call(this,"station" in locals_for_with?locals_for_with.station:typeof station!=="undefined"?station:undefined));;return buf.join("");
};
}, {"jade-runtime":8}],
10: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (station) {
buf.push("<h2 class=\"title\">" + (jade.escape(null == (jade_interp = 'Trains from ' + station.name) ? "" : jade_interp)) + "</h2>");}.call(this,"station" in locals_for_with?locals_for_with.station:typeof station!=="undefined"?station:undefined));;return buf.join("");
};
}, {"jade-runtime":8}],
5: [function(require, module, exports) {
'use strict';

var template = require('./train-status.jade');

exports.render = function (data) {
    console.log('train status')
  $('#tflStatus').replaceWith(template({ 'tflStatus': data }));
};

}, {"./train-status.jade":11}],
11: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (tflStatus, count, RegExp) {
if ( tflStatus)
{
buf.push("<div id=\"tflStatus\"><ul>");
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
buf.push("</ul></div>");
}}.call(this,"tflStatus" in locals_for_with?locals_for_with.tflStatus:typeof tflStatus!=="undefined"?tflStatus:undefined,"count" in locals_for_with?locals_for_with.count:typeof count!=="undefined"?count:undefined,"RegExp" in locals_for_with?locals_for_with.RegExp:typeof RegExp!=="undefined"?RegExp:undefined));;return buf.join("");
};
}, {"jade-runtime":8}],
6: [function(require, module, exports) {
module.exports = {
  "bank": "BNK",
  "barkingside": "BDE",
  "bethnal-green": "BNG",
  "bond-street": "BDS",
  "buckhurst-hill": "BHL",
  "chancery-lane": "CYL",
  "chigwell": "CHG",
  "debden": "DEB",
  "ealing-broadway": "EBY",
  "east-acton": "EAC",
  "epping": "EPP",
  "fairlop": "FLP",
  "gants-hill": "GHL",
  "grange-hill": "GRH",
  "greenford": "GFD",
  "hainault": "HAI",
  "hanger-lane": "HLN",
  "holborn": "HOL",
  "holland-park": "HPK",
  "lancaster-gate": "LAN",
  "leyton": "LEY",
  "leytonstone": "LYS",
  "liverpool-street": "LST",
  "loughton": "LTN",
  "marble-arch": "MAR",
  "mile-end": "MLE",
  "newbury-park": "NEP",
  "north-acton": "NAC",
  "northolt": "NHT",
  "notting-hill-gate": "NHG",
  "oxford-circus": "OXC",
  "perivale": "PER",
  "queensway": "QWY",
  "redbridge": "RED",
  "roding-valley": "ROD",
  "ruislip-gardens": "RUG",
  "shepherds-bush": "SBC",
  "snaresbrook": "SNB",
  "south-ruislip": "SRP",
  "south-woodford": "SWF",
  "st-pauls": "STP",
  "stratford": "SFD",
  "theydon-bois": "THB",
  "tottenham-court-road": "TCR",
  "wanstead": "WAN",
  "west-acton": "WAC",
  "west-ruislip": "WRP",
  "white-city": "WCT",
  "woodford": "WFD"
};
}, {}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVpcmUuanMiLCJjbGllbnQvc2hhcmVkLmpzIiwicHVibGljL2xpYnMvcGFnZS5qcyIsImNvbXBvbmVudHMvbmV4dC1idXMvbmV4dC1idXMuanMiLCJjb21wb25lbnRzL25leHQtYnVzL25leHQtYnVzLmphZGUiLCJqYWRlLXJ1bnRpbWUiLCJjb21wb25lbnRzL25leHQtdHJhaW4vbmV4dC10cmFpbi5qcyIsImNvbXBvbmVudHMvbmV4dC10cmFpbi90cmFpbnMuamFkZSIsImNvbXBvbmVudHMvbmV4dC10cmFpbi90aXRsZS5qYWRlIiwiY29tcG9uZW50cy90cmFpbi1zdGF0dXMvdHJhaW4tc3RhdHVzLmpzIiwiY29tcG9uZW50cy90cmFpbi1zdGF0dXMvdHJhaW4tc3RhdHVzLmphZGUiLCJmZXRjaGVycy9uZXh0LXRyYWluL3VybC1jb2Rlcy5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBvdXRlcihtb2R1bGVzLCBjYWNoZSwgZW50cmllcyl7XG5cbiAgLyoqXG4gICAqIEdsb2JhbFxuICAgKi9cblxuICB2YXIgZ2xvYmFsID0gKGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9KSgpO1xuXG4gIC8qKlxuICAgKiBSZXF1aXJlIGBuYW1lYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtCb29sZWFufSBqdW1wZWRcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gcmVxdWlyZShuYW1lLCBqdW1wZWQpe1xuICAgIGlmIChjYWNoZVtuYW1lXSkgcmV0dXJuIGNhY2hlW25hbWVdLmV4cG9ydHM7XG4gICAgaWYgKG1vZHVsZXNbbmFtZV0pIHJldHVybiBjYWxsKG5hbWUsIHJlcXVpcmUpO1xuICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IGZpbmQgbW9kdWxlIFwiJyArIG5hbWUgKyAnXCInKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIG1vZHVsZSBgaWRgIGFuZCBjYWNoZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJlcXVpcmVcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBjYWxsKGlkLCByZXF1aXJlKXtcbiAgICB2YXIgbSA9IGNhY2hlW2lkXSA9IHsgZXhwb3J0czoge30gfTtcbiAgICB2YXIgbW9kID0gbW9kdWxlc1tpZF07XG4gICAgdmFyIG5hbWUgPSBtb2RbMl07XG4gICAgdmFyIGZuID0gbW9kWzBdO1xuXG4gICAgZm4uY2FsbChtLmV4cG9ydHMsIGZ1bmN0aW9uKHJlcSl7XG4gICAgICB2YXIgZGVwID0gbW9kdWxlc1tpZF1bMV1bcmVxXTtcbiAgICAgIHJldHVybiByZXF1aXJlKGRlcCA/IGRlcCA6IHJlcSk7XG4gICAgfSwgbSwgbS5leHBvcnRzLCBvdXRlciwgbW9kdWxlcywgY2FjaGUsIGVudHJpZXMpO1xuXG4gICAgLy8gZXhwb3NlIGFzIGBuYW1lYC5cbiAgICBpZiAobmFtZSkgY2FjaGVbbmFtZV0gPSBjYWNoZVtpZF07XG5cbiAgICByZXR1cm4gY2FjaGVbaWRdLmV4cG9ydHM7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWlyZSBhbGwgZW50cmllcyBleHBvc2luZyB0aGVtIG9uIGdsb2JhbCBpZiBuZWVkZWQuXG4gICAqL1xuXG4gIGZvciAodmFyIGlkIGluIGVudHJpZXMpIHtcbiAgICBpZiAoZW50cmllc1tpZF0pIHtcbiAgICAgIGdsb2JhbFtlbnRyaWVzW2lkXV0gPSByZXF1aXJlKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVxdWlyZShpZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIER1byBmbGFnLlxuICAgKi9cblxuICByZXF1aXJlLmR1byA9IHRydWU7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjYWNoZS5cbiAgICovXG5cbiAgcmVxdWlyZS5jYWNoZSA9IGNhY2hlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgbW9kdWxlc1xuICAgKi9cblxuICByZXF1aXJlLm1vZHVsZXMgPSBtb2R1bGVzO1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gbmV3ZXN0IHJlcXVpcmUuXG4gICAqL1xuXG4gICByZXR1cm4gcmVxdWlyZTtcbn0pIiwiXG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3B1YmxpYy9saWJzL3BhZ2UuanMnKTtcbnZhciBuZXh0QnVzID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9uZXh0LWJ1cy9uZXh0LWJ1cy5qcycpO1xudmFyIG5leHRUcmFpbiA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvbmV4dC10cmFpbi9uZXh0LXRyYWluLmpzJyk7XG52YXIgdHJhaW5TdGF0dXMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RyYWluLXN0YXR1cy90cmFpbi1zdGF0dXMuanMnKTtcblxudmFyIHVybDtcbmlmKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gJ3dvb2Rmb3JkLnRvZGF5Jykge1xuICAgIHVybCA9ICdodHRwOi8vd29vZGZvcmQudG9kYXk6ODAvJztcbn1lbHNlIHtcbiAgICB1cmwgPSAnaHR0cDovL2xvY2FsaG9zdC8nO1xufVxudmFyIHNvY2tldCA9IGlvKHVybCk7XG5cbm5leHRUcmFpbi5iaW5kKCQoJyNuZXh0VHJhaW4nKSwgc29ja2V0KTtcblxuc29ja2V0Lm9uKCd0cmFpblN0YXR1cycsIHRyYWluU3RhdHVzLnJlbmRlcik7XG5zb2NrZXQub24oJ25leHRCdXMnLCBuZXh0QnVzLnJlbmRlcik7XG5cbnBhZ2UoKTtcblxudmFyIHN0YXRpb25Db2RlcyA9IHJlcXVpcmUoJy4uL2ZldGNoZXJzL25leHQtdHJhaW4vdXJsLWNvZGVzLmpzb24nKTtcblxuXG4vLyB3ZSBuZWVkIHRvIGtub3cgd2hhdCB0aGUgb2xkICBzdGF0aW9uIG5hbWUgd2FzIGhlcmUuIFxuLy8gXG4vLyBkb2VzIHRoaXMgcm91dGUgYWx3YXlzIGdldCBoaXQgb24gY2hhbmdlP1xucGFnZSgnL2NlbnRyYWwtbGluZS86c3RhdGlvbk5hbWUnLCBmdW5jdGlvbihjb250ZXh0LCBuZXh0KSB7XG4gICAgdmFyIGNvZGUgPSBzdGF0aW9uQ29kZXNbY29udGV4dC5wYXJhbXMuc3RhdGlvbk5hbWVdO1xuICAgICQoJ2xpIGEucG9pbnQnKS5yZW1vdmVDbGFzcygncG9pbnQnKTtcbiAgICAkKCcjbWFwLWNvbnRhaW5lcicpLmF0dHIoJ2RhdGEtc3RhdGlvbicsIGNvZGUpO1xuICAgIHZhciBzZWxlY3RvciA9ICd1bC5saW5lIGxpLicgKyBjb2RlICsgJyBhJztcbiAgICAkKHNlbGVjdG9yKS5hZGRDbGFzcygncG9pbnQnKTtcbiAgICBuZXh0VHJhaW4uc2hvd0xvYWRlcigpO1xuICAgIG5leHRUcmFpbi5nZXRTdGF0aW9uRGF0YShjb250ZXh0LnBhcmFtcy5zdGF0aW9uTmFtZSwgc29ja2V0KTtcbn0pO1xuXG4vLyAkKCcgdWwjY2VudHJhbC5saW5lIGxpIGEnKS5jbGljayhmdW5jdGlvbihlKSB7XG4vLyAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gICAgIHZhciBuZXdTdGF0aW9uID0gdGhpcy5ocmVmLnNwbGl0KCcvJykucG9wKCk7XG4vLyAgICAgJCgnI21hcC1jb250YWluZXInKS5hdHRyKCdkYXRhLXN0YXRpb24nLCBuZXdTdGF0aW9uKTtcbi8vICAgICBuZXh0VHJhaW4uZ2V0U3RhdGlvbkRhdGEobmV3U3RhdGlvbiwgc29ja2V0KTtcbi8vIH0pO1xuIiwiIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoW10sZSk7ZWxzZXt2YXIgZjtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P2Y9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Zj1nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJihmPXNlbGYpLGYucGFnZT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblxuICAvKiBqc2hpbnQgYnJvd3Nlcjp0cnVlICovXG5cbiAgLyoqXG4gICAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gICAqL1xuXG4gIHZhciBwYXRodG9SZWdleHAgPSBfZGVyZXFfKCdwYXRoLXRvLXJlZ2V4cCcpO1xuXG4gIC8qKlxuICAgKiBNb2R1bGUgZXhwb3J0cy5cbiAgICovXG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBwYWdlO1xuXG4gIC8qKlxuICAgKiBQZXJmb3JtIGluaXRpYWwgZGlzcGF0Y2guXG4gICAqL1xuXG4gIHZhciBkaXNwYXRjaCA9IHRydWU7XG5cbiAgLyoqXG4gICAqIEJhc2UgcGF0aC5cbiAgICovXG5cbiAgdmFyIGJhc2UgPSAnJztcblxuICAvKipcbiAgICogUnVubmluZyBmbGFnLlxuICAgKi9cblxuICB2YXIgcnVubmluZztcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYHBhdGhgIHdpdGggY2FsbGJhY2sgYGZuKClgLFxuICAgKiBvciByb3V0ZSBgcGF0aGAsIG9yIGBwYWdlLnN0YXJ0KClgLlxuICAgKlxuICAgKiAgIHBhZ2UoZm4pO1xuICAgKiAgIHBhZ2UoJyonLCBmbik7XG4gICAqICAgcGFnZSgnL3VzZXIvOmlkJywgbG9hZCwgdXNlcik7XG4gICAqICAgcGFnZSgnL3VzZXIvJyArIHVzZXIuaWQsIHsgc29tZTogJ3RoaW5nJyB9KTtcbiAgICogICBwYWdlKCcvdXNlci8nICsgdXNlci5pZCk7XG4gICAqICAgcGFnZSgpO1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gcGF0aFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbi4uLlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBwYWdlKHBhdGgsIGZuKSB7XG4gICAgLy8gPGNhbGxiYWNrPlxuICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBwYXRoKSB7XG4gICAgICByZXR1cm4gcGFnZSgnKicsIHBhdGgpO1xuICAgIH1cblxuICAgIC8vIHJvdXRlIDxwYXRoPiB0byA8Y2FsbGJhY2sgLi4uPlxuICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBmbikge1xuICAgICAgdmFyIHJvdXRlID0gbmV3IFJvdXRlKHBhdGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcGFnZS5jYWxsYmFja3MucHVzaChyb3V0ZS5taWRkbGV3YXJlKGFyZ3VtZW50c1tpXSkpO1xuICAgICAgfVxuICAgIC8vIHNob3cgPHBhdGg+IHdpdGggW3N0YXRlXVxuICAgIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHBhZ2Uuc2hvdyhwYXRoLCBmbik7XG4gICAgLy8gc3RhcnQgW29wdGlvbnNdXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhZ2Uuc3RhcnQocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9ucy5cbiAgICovXG5cbiAgcGFnZS5jYWxsYmFja3MgPSBbXTtcblxuICAvKipcbiAgICogR2V0IG9yIHNldCBiYXNlcGF0aCB0byBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2UuYmFzZSA9IGZ1bmN0aW9uKHBhdGgpe1xuICAgIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBiYXNlO1xuICAgIGJhc2UgPSBwYXRoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBCaW5kIHdpdGggdGhlIGdpdmVuIGBvcHRpb25zYC5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogICAgLSBgY2xpY2tgIGJpbmQgdG8gY2xpY2sgZXZlbnRzIFt0cnVlXVxuICAgKiAgICAtIGBwb3BzdGF0ZWAgYmluZCB0byBwb3BzdGF0ZSBbdHJ1ZV1cbiAgICogICAgLSBgZGlzcGF0Y2hgIHBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaCBbdHJ1ZV1cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zdGFydCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmIChydW5uaW5nKSByZXR1cm47XG4gICAgcnVubmluZyA9IHRydWU7XG4gICAgaWYgKGZhbHNlID09PSBvcHRpb25zLmRpc3BhdGNoKSBkaXNwYXRjaCA9IGZhbHNlO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5wb3BzdGF0ZSkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgb25wb3BzdGF0ZSwgZmFsc2UpO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5jbGljaykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25jbGljaywgZmFsc2UpO1xuICAgIGlmICghZGlzcGF0Y2gpIHJldHVybjtcbiAgICB2YXIgdXJsID0gbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2ggKyBsb2NhdGlvbi5oYXNoO1xuICAgIHBhZ2UucmVwbGFjZSh1cmwsIG51bGwsIHRydWUsIGRpc3BhdGNoKTtcbiAgfTtcblxuICAvKipcbiAgICogVW5iaW5kIGNsaWNrIGFuZCBwb3BzdGF0ZSBldmVudCBoYW5kbGVycy5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvbnBvcHN0YXRlLCBmYWxzZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNob3cgYHBhdGhgIHdpdGggb3B0aW9uYWwgYHN0YXRlYCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRpc3BhdGNoXG4gICAqIEByZXR1cm4ge0NvbnRleHR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2Uuc2hvdyA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlLCBkaXNwYXRjaCl7XG4gICAgdmFyIGN0eCA9IG5ldyBDb250ZXh0KHBhdGgsIHN0YXRlKTtcbiAgICBpZiAoZmFsc2UgIT09IGRpc3BhdGNoKSBwYWdlLmRpc3BhdGNoKGN0eCk7XG4gICAgaWYgKCFjdHgudW5oYW5kbGVkKSBjdHgucHVzaFN0YXRlKCk7XG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICAvKipcbiAgICogUmVwbGFjZSBgcGF0aGAgd2l0aCBvcHRpb25hbCBgc3RhdGVgIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqIEByZXR1cm4ge0NvbnRleHR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2UucmVwbGFjZSA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlLCBpbml0LCBkaXNwYXRjaCl7XG4gICAgdmFyIGN0eCA9IG5ldyBDb250ZXh0KHBhdGgsIHN0YXRlKTtcbiAgICBjdHguaW5pdCA9IGluaXQ7XG4gICAgaWYgKG51bGwgPT0gZGlzcGF0Y2gpIGRpc3BhdGNoID0gdHJ1ZTtcbiAgICBpZiAoZGlzcGF0Y2gpIHBhZ2UuZGlzcGF0Y2goY3R4KTtcbiAgICBjdHguc2F2ZSgpO1xuICAgIHJldHVybiBjdHg7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoIHRoZSBnaXZlbiBgY3R4YC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGN0eFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgcGFnZS5kaXNwYXRjaCA9IGZ1bmN0aW9uKGN0eCl7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHZhciBmbiA9IHBhZ2UuY2FsbGJhY2tzW2krK107XG4gICAgICBpZiAoIWZuKSByZXR1cm4gdW5oYW5kbGVkKGN0eCk7XG4gICAgICBmbihjdHgsIG5leHQpO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcblxuICAvKipcbiAgICogVW5oYW5kbGVkIGBjdHhgLiBXaGVuIGl0J3Mgbm90IHRoZSBpbml0aWFsXG4gICAqIHBvcHN0YXRlIHRoZW4gcmVkaXJlY3QuIElmIHlvdSB3aXNoIHRvIGhhbmRsZVxuICAgKiA0MDRzIG9uIHlvdXIgb3duIHVzZSBgcGFnZSgnKicsIGNhbGxiYWNrKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Q29udGV4dH0gY3R4XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiB1bmhhbmRsZWQoY3R4KSB7XG4gICAgdmFyIGN1cnJlbnQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICAgIGlmIChjdXJyZW50ID09IGN0eC5jYW5vbmljYWxQYXRoKSByZXR1cm47XG4gICAgcGFnZS5zdG9wKCk7XG4gICAgY3R4LnVuaGFuZGxlZCA9IHRydWU7XG4gICAgd2luZG93LmxvY2F0aW9uID0gY3R4LmNhbm9uaWNhbFBhdGg7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBhIG5ldyBcInJlcXVlc3RcIiBgQ29udGV4dGBcbiAgICogd2l0aCB0aGUgZ2l2ZW4gYHBhdGhgIGFuZCBvcHRpb25hbCBpbml0aWFsIGBzdGF0ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBDb250ZXh0KHBhdGgsIHN0YXRlKSB7XG4gICAgaWYgKCcvJyA9PSBwYXRoWzBdICYmIDAgIT0gcGF0aC5pbmRleE9mKGJhc2UpKSBwYXRoID0gYmFzZSArIHBhdGg7XG4gICAgdmFyIGkgPSBwYXRoLmluZGV4T2YoJz8nKTtcblxuICAgIHRoaXMuY2Fub25pY2FsUGF0aCA9IHBhdGg7XG4gICAgdGhpcy5wYXRoID0gcGF0aC5yZXBsYWNlKGJhc2UsICcnKSB8fCAnLyc7XG5cbiAgICB0aGlzLnRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuICAgIHRoaXMuc3RhdGUucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5xdWVyeXN0cmluZyA9IH5pID8gcGF0aC5zbGljZShpICsgMSkgOiAnJztcbiAgICB0aGlzLnBhdGhuYW1lID0gfmkgPyBwYXRoLnNsaWNlKDAsIGkpIDogcGF0aDtcbiAgICB0aGlzLnBhcmFtcyA9IFtdO1xuXG4gICAgLy8gZnJhZ21lbnRcbiAgICB0aGlzLmhhc2ggPSAnJztcbiAgICBpZiAoIX50aGlzLnBhdGguaW5kZXhPZignIycpKSByZXR1cm47XG4gICAgdmFyIHBhcnRzID0gdGhpcy5wYXRoLnNwbGl0KCcjJyk7XG4gICAgdGhpcy5wYXRoID0gcGFydHNbMF07XG4gICAgdGhpcy5oYXNoID0gcGFydHNbMV0gfHwgJyc7XG4gICAgdGhpcy5xdWVyeXN0cmluZyA9IHRoaXMucXVlcnlzdHJpbmcuc3BsaXQoJyMnKVswXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgYENvbnRleHRgLlxuICAgKi9cblxuICBwYWdlLkNvbnRleHQgPSBDb250ZXh0O1xuXG4gIC8qKlxuICAgKiBQdXNoIHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgQ29udGV4dC5wcm90b3R5cGUucHVzaFN0YXRlID0gZnVuY3Rpb24oKXtcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSh0aGlzLnN0YXRlLCB0aGlzLnRpdGxlLCB0aGlzLmNhbm9uaWNhbFBhdGgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTYXZlIHRoZSBjb250ZXh0IHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBDb250ZXh0LnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24oKXtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh0aGlzLnN0YXRlLCB0aGlzLnRpdGxlLCB0aGlzLmNhbm9uaWNhbFBhdGgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGBSb3V0ZWAgd2l0aCB0aGUgZ2l2ZW4gSFRUUCBgcGF0aGAsXG4gICAqIGFuZCBhbiBhcnJheSBvZiBgY2FsbGJhY2tzYCBhbmQgYG9wdGlvbnNgLlxuICAgKlxuICAgKiBPcHRpb25zOlxuICAgKlxuICAgKiAgIC0gYHNlbnNpdGl2ZWAgICAgZW5hYmxlIGNhc2Utc2Vuc2l0aXZlIHJvdXRlc1xuICAgKiAgIC0gYHN0cmljdGAgICAgICAgZW5hYmxlIHN0cmljdCBtYXRjaGluZyBmb3IgdHJhaWxpbmcgc2xhc2hlc1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFJvdXRlKHBhdGgsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnBhdGggPSAocGF0aCA9PT0gJyonKSA/ICcoLiopJyA6IHBhdGg7XG4gICAgdGhpcy5tZXRob2QgPSAnR0VUJztcbiAgICB0aGlzLnJlZ2V4cCA9IHBhdGh0b1JlZ2V4cCh0aGlzLnBhdGhcbiAgICAgICwgdGhpcy5rZXlzID0gW11cbiAgICAgICwgb3B0aW9ucy5zZW5zaXRpdmVcbiAgICAgICwgb3B0aW9ucy5zdHJpY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBgUm91dGVgLlxuICAgKi9cblxuICBwYWdlLlJvdXRlID0gUm91dGU7XG5cbiAgLyoqXG4gICAqIFJldHVybiByb3V0ZSBtaWRkbGV3YXJlIHdpdGhcbiAgICogdGhlIGdpdmVuIGNhbGxiYWNrIGBmbigpYC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFJvdXRlLnByb3RvdHlwZS5taWRkbGV3YXJlID0gZnVuY3Rpb24oZm4pe1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24oY3R4LCBuZXh0KXtcbiAgICAgIGlmIChzZWxmLm1hdGNoKGN0eC5wYXRoLCBjdHgucGFyYW1zKSkgcmV0dXJuIGZuKGN0eCwgbmV4dCk7XG4gICAgICBuZXh0KCk7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhpcyByb3V0ZSBtYXRjaGVzIGBwYXRoYCwgaWYgc29cbiAgICogcG9wdWxhdGUgYHBhcmFtc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBhcmFtc1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgUm91dGUucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24ocGF0aCwgcGFyYW1zKXtcbiAgICB2YXIga2V5cyA9IHRoaXMua2V5c1xuICAgICAgLCBxc0luZGV4ID0gcGF0aC5pbmRleE9mKCc/JylcbiAgICAgICwgcGF0aG5hbWUgPSB+cXNJbmRleCA/IHBhdGguc2xpY2UoMCwgcXNJbmRleCkgOiBwYXRoXG4gICAgICAsIG0gPSB0aGlzLnJlZ2V4cC5leGVjKGRlY29kZVVSSUNvbXBvbmVudChwYXRobmFtZSkpO1xuXG4gICAgaWYgKCFtKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMSwgbGVuID0gbS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaSAtIDFdO1xuXG4gICAgICB2YXIgdmFsID0gJ3N0cmluZycgPT0gdHlwZW9mIG1baV1cbiAgICAgICAgPyBkZWNvZGVVUklDb21wb25lbnQobVtpXSlcbiAgICAgICAgOiBtW2ldO1xuXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHBhcmFtc1trZXkubmFtZV0gPSB1bmRlZmluZWQgIT09IHBhcmFtc1trZXkubmFtZV1cbiAgICAgICAgICA/IHBhcmFtc1trZXkubmFtZV1cbiAgICAgICAgICA6IHZhbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtcy5wdXNoKHZhbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBcInBvcHVsYXRlXCIgZXZlbnRzLlxuICAgKi9cblxuICBmdW5jdGlvbiBvbnBvcHN0YXRlKGUpIHtcbiAgICBpZiAoZS5zdGF0ZSkge1xuICAgICAgdmFyIHBhdGggPSBlLnN0YXRlLnBhdGg7XG4gICAgICBwYWdlLnJlcGxhY2UocGF0aCwgZS5zdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBcImNsaWNrXCIgZXZlbnRzLlxuICAgKi9cblxuICBmdW5jdGlvbiBvbmNsaWNrKGUpIHtcbiAgICBpZiAoMSAhPSB3aGljaChlKSkgcmV0dXJuO1xuICAgIGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcbiAgICBpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cbiAgICAvLyBlbnN1cmUgbGlua1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIHdoaWxlIChlbCAmJiAnQScgIT0gZWwubm9kZU5hbWUpIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICBpZiAoIWVsIHx8ICdBJyAhPSBlbC5ub2RlTmFtZSkgcmV0dXJuO1xuXG4gICAgLy8gZW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG4gICAgdmFyIGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoZWwucGF0aG5hbWUgPT0gbG9jYXRpb24ucGF0aG5hbWUgJiYgKGVsLmhhc2ggfHwgJyMnID09IGxpbmspKSByZXR1cm47XG5cbiAgICAvLyBDaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuICAgIGlmIChsaW5rLmluZGV4T2YoXCJtYWlsdG86XCIpID4gLTEpIHJldHVybjtcblxuICAgIC8vIGNoZWNrIHRhcmdldFxuICAgIGlmIChlbC50YXJnZXQpIHJldHVybjtcblxuICAgIC8vIHgtb3JpZ2luXG4gICAgaWYgKCFzYW1lT3JpZ2luKGVsLmhyZWYpKSByZXR1cm47XG5cbiAgICAvLyByZWJ1aWxkIHBhdGhcbiAgICB2YXIgcGF0aCA9IGVsLnBhdGhuYW1lICsgZWwuc2VhcmNoICsgKGVsLmhhc2ggfHwgJycpO1xuXG4gICAgLy8gc2FtZSBwYWdlXG4gICAgdmFyIG9yaWcgPSBwYXRoICsgZWwuaGFzaDtcblxuICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoYmFzZSwgJycpO1xuICAgIGlmIChiYXNlICYmIG9yaWcgPT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHBhZ2Uuc2hvdyhvcmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBidXR0b24uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHdoaWNoKGUpIHtcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgcmV0dXJuIG51bGwgPT0gZS53aGljaFxuICAgICAgPyBlLmJ1dHRvblxuICAgICAgOiBlLndoaWNoO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBocmVmYCBpcyB0aGUgc2FtZSBvcmlnaW4uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHNhbWVPcmlnaW4oaHJlZikge1xuICAgIHZhciBvcmlnaW4gPSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0bmFtZTtcbiAgICBpZiAobG9jYXRpb24ucG9ydCkgb3JpZ2luICs9ICc6JyArIGxvY2F0aW9uLnBvcnQ7XG4gICAgcmV0dXJuIDAgPT0gaHJlZi5pbmRleE9mKG9yaWdpbik7XG4gIH1cblxufSx7XCJwYXRoLXRvLXJlZ2V4cFwiOjJ9XSwyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogRXhwb3NlIGBwYXRodG9SZWdleHBgLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGh0b1JlZ2V4cDtcblxudmFyIFBBVEhfUkVHRVhQID0gbmV3IFJlZ0V4cChbXG4gIC8vIE1hdGNoIGFscmVhZHkgZXNjYXBlZCBjaGFyYWN0ZXJzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGluY29ycmVjdGx5IGFwcGVhclxuICAvLyBpbiBmdXR1cmUgbWF0Y2hlcy4gVGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gZXNjYXBlIHNwZWNpYWwgY2hhcmFjdGVycyB0aGF0XG4gIC8vIHNob3VsZG4ndCBiZSB0cmFuc2Zvcm1lZC5cbiAgJyhcXFxcXFxcXC4pJyxcbiAgLy8gTWF0Y2ggRXhwcmVzcy1zdHlsZSBwYXJhbWV0ZXJzIGFuZCB1bi1uYW1lZCBwYXJhbWV0ZXJzIHdpdGggYSBwcmVmaXhcbiAgLy8gYW5kIG9wdGlvbmFsIHN1ZmZpeGVzLiBNYXRjaGVzIGFwcGVhciBhczpcbiAgLy9cbiAgLy8gXCIvOnRlc3QoXFxcXGQrKT9cIiA9PiBbXCIvXCIsIFwidGVzdFwiLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCBcIj9cIl1cbiAgLy8gXCIvcm91dGUoXFxcXGQrKVwiID0+IFt1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIlxcZCtcIiwgdW5kZWZpbmVkXVxuICAnKFtcXFxcLy5dKT8oPzpcXFxcOihcXFxcdyspKD86XFxcXCgoKD86XFxcXFxcXFwufFteKV0pKilcXFxcKSk/fFxcXFwoKCg/OlxcXFxcXFxcLnxbXildKSopXFxcXCkpKFsrKj9dKT8nLFxuICAvLyBNYXRjaCByZWdleHAgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGFsd2F5cyBiZSBlc2NhcGVkLlxuICAnKFsuKyo/PV4hOiR7fSgpW1xcXFxdfFxcXFwvXSknXG5dLmpvaW4oJ3wnKSwgJ2cnKTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGNhcHR1cmluZyBncm91cCBieSBlc2NhcGluZyBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIG1lYW5pbmcuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBncm91cFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVHcm91cCAoZ3JvdXApIHtcbiAgcmV0dXJuIGdyb3VwLnJlcGxhY2UoLyhbPSE6JFxcLygpXSkvZywgJ1xcXFwkMScpO1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZ2l2ZW4gcGF0aCBzdHJpbmcsIHJldHVybmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBBbiBlbXB0eSBhcnJheSBzaG91bGQgYmUgcGFzc2VkIGluLCB3aGljaCB3aWxsIGNvbnRhaW4gdGhlIHBsYWNlaG9sZGVyIGtleVxuICogbmFtZXMuIEZvciBleGFtcGxlIGAvdXNlci86aWRgIHdpbGwgdGhlbiBjb250YWluIGBbXCJpZFwiXWAuXG4gKlxuICogQHBhcmFtICB7KFN0cmluZ3xSZWdFeHB8QXJyYXkpfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgICAgICAgICAgIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gICAgICAgICAgICAgICAgb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBwYXRodG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAga2V5cyA9IGtleXMgfHwgW107XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdDtcbiAgdmFyIGVuZCA9IG9wdGlvbnMuZW5kICE9PSBmYWxzZTtcbiAgdmFyIGZsYWdzID0gb3B0aW9ucy5zZW5zaXRpdmUgPyAnJyA6ICdpJztcbiAgdmFyIGluZGV4ID0gMDtcblxuICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIC8vIE1hdGNoIGFsbCBjYXB0dXJpbmcgZ3JvdXBzIG9mIGEgcmVnZXhwLlxuICAgIHZhciBncm91cHMgPSBwYXRoLnNvdXJjZS5tYXRjaCgvXFwoKD8hXFw/KS9nKSB8fCBbXTtcblxuICAgIC8vIE1hcCBhbGwgdGhlIG1hdGNoZXMgdG8gdGhlaXIgbnVtZXJpYyBrZXlzIGFuZCBwdXNoIGludG8gdGhlIGtleXMuXG4gICAga2V5cy5wdXNoLmFwcGx5KGtleXMsIGdyb3Vwcy5tYXAoZnVuY3Rpb24gKG1hdGNoLCBpbmRleCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogICAgICBpbmRleCxcbiAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICBvcHRpb25hbDogIGZhbHNlLFxuICAgICAgICByZXBlYXQ6ICAgIGZhbHNlXG4gICAgICB9O1xuICAgIH0pKTtcblxuICAgIC8vIFJldHVybiB0aGUgc291cmNlIGJhY2sgdG8gdGhlIHVzZXIuXG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheShwYXRoKSkge1xuICAgIC8vIE1hcCBhcnJheSBwYXJ0cyBpbnRvIHJlZ2V4cHMgYW5kIHJldHVybiB0aGVpciBzb3VyY2UuIFdlIGFsc28gcGFzc1xuICAgIC8vIHRoZSBzYW1lIGtleXMgYW5kIG9wdGlvbnMgaW5zdGFuY2UgaW50byBldmVyeSBnZW5lcmF0aW9uIHRvIGdldFxuICAgIC8vIGNvbnNpc3RlbnQgbWF0Y2hpbmcgZ3JvdXBzIGJlZm9yZSB3ZSBqb2luIHRoZSBzb3VyY2VzIHRvZ2V0aGVyLlxuICAgIHBhdGggPSBwYXRoLm1hcChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBwYXRodG9SZWdleHAodmFsdWUsIGtleXMsIG9wdGlvbnMpLnNvdXJjZTtcbiAgICB9KTtcblxuICAgIC8vIEdlbmVyYXRlIGEgbmV3IHJlZ2V4cCBpbnN0YW5jZSBieSBqb2luaW5nIGFsbCB0aGUgcGFydHMgdG9nZXRoZXIuXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoJyg/OicgKyBwYXRoLmpvaW4oJ3wnKSArICcpJywgZmxhZ3MpO1xuICB9XG5cbiAgLy8gQWx0ZXIgdGhlIHBhdGggc3RyaW5nIGludG8gYSB1c2FibGUgcmVnZXhwLlxuICBwYXRoID0gcGF0aC5yZXBsYWNlKFBBVEhfUkVHRVhQLCBmdW5jdGlvbiAobWF0Y2gsIGVzY2FwZWQsIHByZWZpeCwga2V5LCBjYXB0dXJlLCBncm91cCwgc3VmZml4LCBlc2NhcGUpIHtcbiAgICAvLyBBdm9pZGluZyByZS1lc2NhcGluZyBlc2NhcGVkIGNoYXJhY3RlcnMuXG4gICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgIHJldHVybiBlc2NhcGVkO1xuICAgIH1cblxuICAgIC8vIEVzY2FwZSByZWdleHAgc3BlY2lhbCBjaGFyYWN0ZXJzLlxuICAgIGlmIChlc2NhcGUpIHtcbiAgICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGU7XG4gICAgfVxuXG4gICAgdmFyIHJlcGVhdCAgID0gc3VmZml4ID09PSAnKycgfHwgc3VmZml4ID09PSAnKic7XG4gICAgdmFyIG9wdGlvbmFsID0gc3VmZml4ID09PSAnPycgfHwgc3VmZml4ID09PSAnKic7XG5cbiAgICBrZXlzLnB1c2goe1xuICAgICAgbmFtZTogICAgICBrZXkgfHwgaW5kZXgrKyxcbiAgICAgIGRlbGltaXRlcjogcHJlZml4IHx8ICcvJyxcbiAgICAgIG9wdGlvbmFsOiAgb3B0aW9uYWwsXG4gICAgICByZXBlYXQ6ICAgIHJlcGVhdFxuICAgIH0pO1xuXG4gICAgLy8gRXNjYXBlIHRoZSBwcmVmaXggY2hhcmFjdGVyLlxuICAgIHByZWZpeCA9IHByZWZpeCA/ICdcXFxcJyArIHByZWZpeCA6ICcnO1xuXG4gICAgLy8gTWF0Y2ggdXNpbmcgdGhlIGN1c3RvbSBjYXB0dXJpbmcgZ3JvdXAsIG9yIGZhbGxiYWNrIHRvIGNhcHR1cmluZ1xuICAgIC8vIGV2ZXJ5dGhpbmcgdXAgdG8gdGhlIG5leHQgc2xhc2ggKG9yIG5leHQgcGVyaW9kIGlmIHRoZSBwYXJhbSB3YXNcbiAgICAvLyBwcmVmaXhlZCB3aXRoIGEgcGVyaW9kKS5cbiAgICBjYXB0dXJlID0gZXNjYXBlR3JvdXAoY2FwdHVyZSB8fCBncm91cCB8fCAnW14nICsgKHByZWZpeCB8fCAnXFxcXC8nKSArICddKz8nKTtcblxuICAgIC8vIEFsbG93IHBhcmFtZXRlcnMgdG8gYmUgcmVwZWF0ZWQgbW9yZSB0aGFuIG9uY2UuXG4gICAgaWYgKHJlcGVhdCkge1xuICAgICAgY2FwdHVyZSA9IGNhcHR1cmUgKyAnKD86JyArIHByZWZpeCArIGNhcHR1cmUgKyAnKSonO1xuICAgIH1cblxuICAgIC8vIEFsbG93IGEgcGFyYW1ldGVyIHRvIGJlIG9wdGlvbmFsLlxuICAgIGlmIChvcHRpb25hbCkge1xuICAgICAgcmV0dXJuICcoPzonICsgcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpKT8nO1xuICAgIH1cblxuICAgIC8vIEJhc2ljIHBhcmFtZXRlciBzdXBwb3J0LlxuICAgIHJldHVybiBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJyknO1xuICB9KTtcblxuICAvLyBDaGVjayB3aGV0aGVyIHRoZSBwYXRoIGVuZHMgaW4gYSBzbGFzaCBhcyBpdCBhbHRlcnMgc29tZSBtYXRjaCBiZWhhdmlvdXIuXG4gIHZhciBlbmRzV2l0aFNsYXNoID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdID09PSAnLyc7XG5cbiAgLy8gSW4gbm9uLXN0cmljdCBtb2RlIHdlIGFsbG93IGFuIG9wdGlvbmFsIHRyYWlsaW5nIHNsYXNoIGluIHRoZSBtYXRjaC4gSWZcbiAgLy8gdGhlIHBhdGggdG8gbWF0Y2ggYWxyZWFkeSBlbmRlZCB3aXRoIGEgc2xhc2gsIHdlIG5lZWQgdG8gcmVtb3ZlIGl0IGZvclxuICAvLyBjb25zaXN0ZW5jeS4gVGhlIHNsYXNoIGlzIG9ubHkgdmFsaWQgYXQgdGhlIHZlcnkgZW5kIG9mIGEgcGF0aCBtYXRjaCwgbm90XG4gIC8vIGFueXdoZXJlIGluIHRoZSBtaWRkbGUuIFRoaXMgaXMgaW1wb3J0YW50IGZvciBub24tZW5kaW5nIG1vZGUsIG90aGVyd2lzZVxuICAvLyBcIi90ZXN0L1wiIHdpbGwgbWF0Y2ggXCIvdGVzdC8vcm91dGVcIi5cbiAgaWYgKCFzdHJpY3QpIHtcbiAgICBwYXRoID0gKGVuZHNXaXRoU2xhc2ggPyBwYXRoLnNsaWNlKDAsIC0yKSA6IHBhdGgpICsgJyg/OlxcXFwvKD89JCkpPyc7XG4gIH1cblxuICAvLyBJbiBub24tZW5kaW5nIG1vZGUsIHdlIG5lZWQgcHJvbXB0IHRoZSBjYXB0dXJpbmcgZ3JvdXBzIHRvIG1hdGNoIGFzIG11Y2hcbiAgLy8gYXMgcG9zc2libGUgYnkgdXNpbmcgYSBwb3NpdGl2ZSBsb29rYWhlYWQgZm9yIHRoZSBlbmQgb3IgbmV4dCBwYXRoIHNlZ21lbnQuXG4gIGlmICghZW5kKSB7XG4gICAgcGF0aCArPSBzdHJpY3QgJiYgZW5kc1dpdGhTbGFzaCA/ICcnIDogJyg/PVxcXFwvfCQpJztcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVnRXhwKCdeJyArIHBhdGggKyAoZW5kID8gJyQnIDogJycpLCBmbGFncyk7XG59O1xuXG59LHt9XX0se30sWzFdKVxuKDEpXG59KTtcbiIsInZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vbmV4dC1idXMuamFkZScpO1xuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAkKCcjbmV4dEJ1cycpLnJlcGxhY2VXaXRoKHRlbXBsYXRlKHsgJ25leHRCdXMnOiBkYXRhIH0pKTtcbn07XG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUtcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobmV4dEJ1cykge1xuYnVmLnB1c2goXCI8ZGl2IGlkPVxcXCJuZXh0QnVzXFxcIj48aDI+QnVzZXM8L2gyPjxkaXYgY2xhc3M9XFxcImRpcmVjdGlvblxcXCI+PGgzPlRvIEJhcmtpbmdzaWRlPC9oMz48dWwgY2xhc3M9XFxcInRyYWluc1xcXCI+XCIpO1xuaWYgKCBuZXh0QnVzWycxJ10pXG57XG4vLyBpdGVyYXRlIG5leHRCdXNbJzEnXS5idXNlc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBuZXh0QnVzWycxJ10uYnVzZXM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciBidXMgPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGJ1cy5kdWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBidXMgPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGJ1cy5kdWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PjxkaXYgY2xhc3M9XFxcImRpcmVjdGlvblxcXCI+PGgzPlRvIFdhbHRoYW1zdG93PC9oMz48dWwgY2xhc3M9XFxcInRyYWluc1xcXCI+XCIpO1xuaWYgKCBuZXh0QnVzWycyJ10pXG57XG4vLyBpdGVyYXRlIG5leHRCdXNbJzInXS5idXNlc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBuZXh0QnVzWycyJ10uYnVzZXM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciBidXMgPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGJ1cy5kdWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBidXMgPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGJ1cy5kdWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcIm5leHRCdXNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm5leHRCdXM6dHlwZW9mIG5leHRCdXMhPT1cInVuZGVmaW5lZFwiP25leHRCdXM6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwiIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoZSk7ZWxzZXt2YXIgZjtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P2Y9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Zj1nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJihmPXNlbGYpLGYuamFkZT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcclxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcclxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcclxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gYVxyXG4gKiBAcGFyYW0ge09iamVjdH0gYlxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcclxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgdmFyIGF0dHJzID0gYVswXTtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhdHRycztcclxuICB9XHJcbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcclxuICB2YXIgYmMgPSBiWydjbGFzcyddO1xyXG5cclxuICBpZiAoYWMgfHwgYmMpIHtcclxuICAgIGFjID0gYWMgfHwgW107XHJcbiAgICBiYyA9IGJjIHx8IFtdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xyXG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XHJcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcclxuICAgICAgYVtrZXldID0gYltrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGE7XHJcbn07XHJcblxyXG4vKipcclxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcclxuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcclxufVxyXG5cclxuLyoqXHJcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWxcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xyXG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykuZmlsdGVyKG51bGxzKS5qb2luKCcgJykgOiB2YWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcclxuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xyXG4gIHZhciBidWYgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcclxuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XHJcbiAgaWYgKHRleHQubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuICcnO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XHJcbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XHJcbiAgICBpZiAodmFsKSB7XHJcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcclxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XHJcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XHJcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XHJcbiAgdmFyIGJ1ZiA9IFtdO1xyXG5cclxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XHJcblxyXG4gIGlmIChrZXlzLmxlbmd0aCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXHJcbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcclxuXHJcbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xyXG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XHJcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLmVzY2FwZSA9IGZ1bmN0aW9uIGVzY2FwZShodG1sKXtcclxuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpXHJcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxyXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcclxuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xyXG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcclxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcclxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcclxuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcclxuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XHJcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcclxuICAgIHRocm93IGVycjtcclxuICB9XHJcbiAgdHJ5IHtcclxuICAgIHN0ciA9IHN0ciB8fCBfZGVyZXFfKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxyXG4gIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxyXG4gIH1cclxuICB2YXIgY29udGV4dCA9IDNcclxuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXHJcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcclxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcclxuXHJcbiAgLy8gRXJyb3IgY29udGV4dFxyXG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xyXG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xyXG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcclxuICAgICAgKyBjdXJyXHJcbiAgICAgICsgJ3wgJ1xyXG4gICAgICArIGxpbmU7XHJcbiAgfSkuam9pbignXFxuJyk7XHJcblxyXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXHJcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcclxuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXHJcbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XHJcbiAgdGhyb3cgZXJyO1xyXG59O1xyXG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pXG4oMSlcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi8uLi9wdWJsaWMvbGlicy9wYWdlLmpzJyk7XG52YXIgdGVtcGxhdGVUcmFpbnMgPSByZXF1aXJlKCcuL3RyYWlucy5qYWRlJyk7XG52YXIgdGVtcGxhdGVUaXRsZSA9IHJlcXVpcmUoJy4vdGl0bGUuamFkZScpO1xuXG52YXIgbGlzdGVuID0gZnVuY3Rpb24gKG5ld1N0YXRpb24sIHNvY2tldCkge1xuICAgIGNvbnNvbGUubG9nKCdsaXN0ZW4nLCBuZXdTdGF0aW9uKTtcbiAgICBzb2NrZXQuZW1pdCgnbmV4dC10cmFpbjpzdGF0aW9uOmxpc3RlbjpzdGFydCcsIG5ld1N0YXRpb24pO1xuICAgIHNvY2tldC5vbignbmV4dC10cmFpbjpzdGF0aW9uOicgKyBuZXdTdGF0aW9uLCBleHBvcnRzLnJlbmRlcik7XG59O1xuXG5leHBvcnRzLmdldFN0YXRpb25EYXRhID0gZnVuY3Rpb24gKHN0YXRpb25Db2RlLCBzb2NrZXQpIHtcblxuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogJy9jZW50cmFsLWxpbmUvJyArIHN0YXRpb25Db2RlLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgLy8kKCcud2lkZ2V0JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgIGV4cG9ydHMucmVuZGVyKGRhdGEpO1xuICAgICAgICAgICAgJCgnI2Zsb2F0ZXInKS5oZWlnaHQoJCgnLmNvbnRhaW5lcicpLmhlaWdodCgpKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnI2Zsb2F0ZXInKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgfSwgNjAwKTtcbiAgICAgICAgICAgIGxpc3RlbihkYXRhLmNvZGUsIHNvY2tldCk7XG4gICAgICAgIH1cbiAgICB9KS5mYWlsKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICQoJyNmbG9hdGVyIC50cmFpbnMnKS5odG1sKCc8aDI+U29ycnk8L2gyPjxwPkVycm9yIG9jY3VyZWQgZmV0Y2hpbmcgJyArIHN0YXRpb25Db2RlICsgJzwvcD4nKTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydHMucm91dGVDaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxufTtcblxudmFyIHN0YXRpb25DaGFuZ2UgPSBmdW5jdGlvbiAoc29ja2V0LCBlKSB7XG4gICAgdmFyIG9sZFN0YXRpb24gPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5jdXJyZW50bHlMaXN0ZW5pbmc7XG4gICAgdmFyIG5ld1N0YXRpb24gPSBlLmN1cnJlbnRUYXJnZXQuc2VsZWN0ZWRPcHRpb25zWzBdLnZhbHVlO1xuICAgIHZhciBuZXdTdGF0aW9uU2x1ZyA9IGUuY3VycmVudFRhcmdldC5zZWxlY3RlZE9wdGlvbnNbMF0ubGFiZWwucmVwbGFjZSgvIC9nLCAnLScpLnRvTG93ZXJDYXNlKCk7XG4gICAgcGFnZSgnL2NlbnRyYWwtbGluZS8nICsgbmV3U3RhdGlvblNsdWcpO1xuXG4gICAgY29uc29sZS5sb2coJ3N0b3AgbGlzdGVuaW5nLicsIG9sZFN0YXRpb24pO1xuICAgIHNvY2tldC5lbWl0KCduZXh0LXRyYWluOnN0YXRpb246bGlzdGVuOnN0b3AnLCBvbGRTdGF0aW9uKTtcbiAgICBzb2NrZXQub2ZmKCduZXh0LXRyYWluOnN0YXRpb246JyArIG9sZFN0YXRpb24pO1xuICAgIGV4cG9ydHMuZ2V0U3RhdGlvbkRhdGEobmV3U3RhdGlvblNsdWcsIHNvY2tldCk7XG59O1xuXG5leHBvcnRzLnNob3dMb2FkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkKCcjZmxvYXRlcicpLmFkZENsYXNzKCdsb2FkaW5nJyk7XG59O1xuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyICRub2RlID0gJCgnI25leHRUcmFpbicpO1xuICAgICRub2RlLmZpbmQoJ3NlbGVjdCcpLmF0dHIoJ2RhdGEtY3VycmVudGx5LWxpc3RlbmluZycsIGRhdGEuY29kZSk7XG4gICAgJCgnc2VsZWN0JykudmFsKGRhdGEuY29kZSk7XG4gICAgLy8kKCdib2R5Jykuc2Nyb2xsVG9wKDApO1xuICAgICRub2RlLmZpbmQoJy50cmFpbnMnKS5yZXBsYWNlV2l0aCgkKHRlbXBsYXRlVHJhaW5zKHsgc3RhdGlvbjogZGF0YSB9KSkpO1xufTtcblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24gKCRub2RlLCBzb2NrZXQpIHtcbiAgICB2YXIgJHNlbGVjdCA9ICRub2RlLmZpbmQoJ3NlbGVjdCNzdGF0aW9uQ29kZScpO1xuICAgICRzZWxlY3QuY2hhbmdlKHN0YXRpb25DaGFuZ2UuYmluZChudWxsLCBzb2NrZXQpKTtcbiAgICB2YXIgbmV3U3RhdGlvbiA9ICRzZWxlY3QuZGF0YSgnY3VycmVudGx5TGlzdGVuaW5nJyk7XG4gICAgbGlzdGVuKG5ld1N0YXRpb24sIHNvY2tldCk7XG59O1xuIiwidmFyIGphZGUgPSByZXF1aXJlKCdqYWRlLXJ1bnRpbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKHN0YXRpb24pIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG52YXIgbm9UcmFpbnMgPSB0cnVlO1xuaWYgKCBzdGF0aW9uKVxue1xuLy8gaXRlcmF0ZSBzdGF0aW9uLnRyYWluc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzdGF0aW9uLnRyYWlucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGRpcmVjdGlvbiA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZGlyZWN0aW9uIDwgJCRsOyBkaXJlY3Rpb24rKykge1xuICAgICAgdmFyIHRyYWlucyA9ICQkb2JqW2RpcmVjdGlvbl07XG5cbmlmICggdHJhaW5zLmxlbmd0aCA+IDApXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImRpcmVjdGlvblxcXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZGlyZWN0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG4vLyBpdGVyYXRlIHRyYWluc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSB0cmFpbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PHNwYW4gY2xhc3M9XFxcImRldGFpbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5sb2NhdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvdWw+PC9kaXY+XCIpO1xubm9UcmFpbnMgPSBmYWxzZTtcbn1cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBkaXJlY3Rpb24gaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciB0cmFpbnMgPSAkJG9ialtkaXJlY3Rpb25dO1xuXG5pZiAoIHRyYWlucy5sZW5ndGggPiAwKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJkaXJlY3Rpb25cXFwiPjxoMz5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGRpcmVjdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48dWwgY2xhc3M9XFxcInRyYWluc1xcXCI+XCIpO1xuLy8gaXRlcmF0ZSB0cmFpbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gdHJhaW5zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgJGluZGV4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyAkaW5kZXggPCAkJGw7ICRpbmRleCsrKSB7XG4gICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PHNwYW4gY2xhc3M9XFxcImRldGFpbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5sb2NhdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHRyYWluID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kdWVJbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJkZXN0aW5hdGlvblxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kZXN0aW5hdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PlwiKTtcbm5vVHJhaW5zID0gZmFsc2U7XG59XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmlmICggbm9UcmFpbnMpXG57XG5idWYucHVzaChcIjxoMyBjbGFzcz1cXFwibm9UcmFpbnNcXFwiPk5vIFRyYWluczwvaDM+XCIpO1xufVxuYnVmLnB1c2goXCI8L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJzdGF0aW9uXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zdGF0aW9uOnR5cGVvZiBzdGF0aW9uIT09XCJ1bmRlZmluZWRcIj9zdGF0aW9uOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS1ydW50aW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChzdGF0aW9uKSB7XG5idWYucHVzaChcIjxoMiBjbGFzcz1cXFwidGl0bGVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gJ1RyYWlucyBmcm9tICcgKyBzdGF0aW9uLm5hbWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvaDI+XCIpO30uY2FsbCh0aGlzLFwic3RhdGlvblwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc3RhdGlvbjp0eXBlb2Ygc3RhdGlvbiE9PVwidW5kZWZpbmVkXCI/c3RhdGlvbjp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHJhaW4tc3RhdHVzLmphZGUnKTtcblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCd0cmFpbiBzdGF0dXMnKVxuICAkKCcjdGZsU3RhdHVzJykucmVwbGFjZVdpdGgodGVtcGxhdGUoeyAndGZsU3RhdHVzJzogZGF0YSB9KSk7XG59O1xuIiwidmFyIGphZGUgPSByZXF1aXJlKCdqYWRlLXJ1bnRpbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKHRmbFN0YXR1cywgY291bnQsIFJlZ0V4cCkge1xuaWYgKCB0ZmxTdGF0dXMpXG57XG5idWYucHVzaChcIjxkaXYgaWQ9XFxcInRmbFN0YXR1c1xcXCI+PHVsPlwiKTtcbmNvdW50ID0gMDtcbi8vIGl0ZXJhdGUgdGZsU3RhdHVzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHRmbFN0YXR1cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIHN0YXR1cyA9ICQkb2JqWyRpbmRleF07XG5cbmlmICggc3RhdHVzLlN0YXR1c0RldGFpbHMhPT0nJylcbntcbnZhciByZWdleCA9IG5ldyBSZWdFeHAoJyAnLCBcImdcIilcbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoWydsaW5lICcrc3RhdHVzLkxpbmUuTmFtZS5yZXBsYWNlKHJlZ2V4LCAnJyldLCBbdHJ1ZV0pKSArIFwiPjxoMz5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHN0YXR1cy5MaW5lLk5hbWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvaDM+PGRpdj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHN0YXR1cy5TdGF0dXNEZXRhaWxzKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2Rpdj5cIik7XG5jb3VudCsrXG5idWYucHVzaChcIjwvbGk+XCIpO1xufVxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHN0YXR1cyA9ICQkb2JqWyRpbmRleF07XG5cbmlmICggc3RhdHVzLlN0YXR1c0RldGFpbHMhPT0nJylcbntcbnZhciByZWdleCA9IG5ldyBSZWdFeHAoJyAnLCBcImdcIilcbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoWydsaW5lICcrc3RhdHVzLkxpbmUuTmFtZS5yZXBsYWNlKHJlZ2V4LCAnJyldLCBbdHJ1ZV0pKSArIFwiPjxoMz5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHN0YXR1cy5MaW5lLk5hbWUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvaDM+PGRpdj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHN0YXR1cy5TdGF0dXNEZXRhaWxzKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2Rpdj5cIik7XG5jb3VudCsrXG5idWYucHVzaChcIjwvbGk+XCIpO1xufVxuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5pZiAoIGNvdW50ID09PSAwKVxue1xuYnVmLnB1c2goXCI8ZGl2PkFsbCBsaW5lcyBvcGVyYXRpb25hbC48L2Rpdj5cIik7XG59XG5idWYucHVzaChcIjwvdWw+PC9kaXY+XCIpO1xufX0uY2FsbCh0aGlzLFwidGZsU3RhdHVzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50ZmxTdGF0dXM6dHlwZW9mIHRmbFN0YXR1cyE9PVwidW5kZWZpbmVkXCI/dGZsU3RhdHVzOnVuZGVmaW5lZCxcImNvdW50XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jb3VudDp0eXBlb2YgY291bnQhPT1cInVuZGVmaW5lZFwiP2NvdW50OnVuZGVmaW5lZCxcIlJlZ0V4cFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguUmVnRXhwOnR5cGVvZiBSZWdFeHAhPT1cInVuZGVmaW5lZFwiP1JlZ0V4cDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJiYW5rXCI6IFwiQk5LXCIsXG4gIFwiYmFya2luZ3NpZGVcIjogXCJCREVcIixcbiAgXCJiZXRobmFsLWdyZWVuXCI6IFwiQk5HXCIsXG4gIFwiYm9uZC1zdHJlZXRcIjogXCJCRFNcIixcbiAgXCJidWNraHVyc3QtaGlsbFwiOiBcIkJITFwiLFxuICBcImNoYW5jZXJ5LWxhbmVcIjogXCJDWUxcIixcbiAgXCJjaGlnd2VsbFwiOiBcIkNIR1wiLFxuICBcImRlYmRlblwiOiBcIkRFQlwiLFxuICBcImVhbGluZy1icm9hZHdheVwiOiBcIkVCWVwiLFxuICBcImVhc3QtYWN0b25cIjogXCJFQUNcIixcbiAgXCJlcHBpbmdcIjogXCJFUFBcIixcbiAgXCJmYWlybG9wXCI6IFwiRkxQXCIsXG4gIFwiZ2FudHMtaGlsbFwiOiBcIkdITFwiLFxuICBcImdyYW5nZS1oaWxsXCI6IFwiR1JIXCIsXG4gIFwiZ3JlZW5mb3JkXCI6IFwiR0ZEXCIsXG4gIFwiaGFpbmF1bHRcIjogXCJIQUlcIixcbiAgXCJoYW5nZXItbGFuZVwiOiBcIkhMTlwiLFxuICBcImhvbGJvcm5cIjogXCJIT0xcIixcbiAgXCJob2xsYW5kLXBhcmtcIjogXCJIUEtcIixcbiAgXCJsYW5jYXN0ZXItZ2F0ZVwiOiBcIkxBTlwiLFxuICBcImxleXRvblwiOiBcIkxFWVwiLFxuICBcImxleXRvbnN0b25lXCI6IFwiTFlTXCIsXG4gIFwibGl2ZXJwb29sLXN0cmVldFwiOiBcIkxTVFwiLFxuICBcImxvdWdodG9uXCI6IFwiTFROXCIsXG4gIFwibWFyYmxlLWFyY2hcIjogXCJNQVJcIixcbiAgXCJtaWxlLWVuZFwiOiBcIk1MRVwiLFxuICBcIm5ld2J1cnktcGFya1wiOiBcIk5FUFwiLFxuICBcIm5vcnRoLWFjdG9uXCI6IFwiTkFDXCIsXG4gIFwibm9ydGhvbHRcIjogXCJOSFRcIixcbiAgXCJub3R0aW5nLWhpbGwtZ2F0ZVwiOiBcIk5IR1wiLFxuICBcIm94Zm9yZC1jaXJjdXNcIjogXCJPWENcIixcbiAgXCJwZXJpdmFsZVwiOiBcIlBFUlwiLFxuICBcInF1ZWVuc3dheVwiOiBcIlFXWVwiLFxuICBcInJlZGJyaWRnZVwiOiBcIlJFRFwiLFxuICBcInJvZGluZy12YWxsZXlcIjogXCJST0RcIixcbiAgXCJydWlzbGlwLWdhcmRlbnNcIjogXCJSVUdcIixcbiAgXCJzaGVwaGVyZHMtYnVzaFwiOiBcIlNCQ1wiLFxuICBcInNuYXJlc2Jyb29rXCI6IFwiU05CXCIsXG4gIFwic291dGgtcnVpc2xpcFwiOiBcIlNSUFwiLFxuICBcInNvdXRoLXdvb2Rmb3JkXCI6IFwiU1dGXCIsXG4gIFwic3QtcGF1bHNcIjogXCJTVFBcIixcbiAgXCJzdHJhdGZvcmRcIjogXCJTRkRcIixcbiAgXCJ0aGV5ZG9uLWJvaXNcIjogXCJUSEJcIixcbiAgXCJ0b3R0ZW5oYW0tY291cnQtcm9hZFwiOiBcIlRDUlwiLFxuICBcIndhbnN0ZWFkXCI6IFwiV0FOXCIsXG4gIFwid2VzdC1hY3RvblwiOiBcIldBQ1wiLFxuICBcIndlc3QtcnVpc2xpcFwiOiBcIldSUFwiLFxuICBcIndoaXRlLWNpdHlcIjogXCJXQ1RcIixcbiAgXCJ3b29kZm9yZFwiOiBcIldGRFwiXG59OyJdfQ==