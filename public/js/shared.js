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

page('/central-line/:stationName', function(context, next) {
    if(context.init) {
        nextTrain.setup(context.params.stationName, socket);
    } else {
        var code = stationCodes[context.params.stationName];
        nextTrain.load(context.params.stationName, socket);
        $('#map-container').attr('data-station', code);
        $('li a.point').removeClass('point');
        $('ul.line li.' + code + ' a').addClass('point');

    }
});


window.onresize = nextTrain.resize;
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
var templateError = require('./error.jade');
//var templateTitle = require('./title.jade');
var urlCodes = require('../../fetchers/next-train/url-codes.json');

var listen = function (newStation, socket) {
    console.log('listen', newStation);
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('next-train:station:' + newStation, exports.render);
};

var hideLoader = function() {
    $('#floater').removeClass('loading');
};

var showLoader = function() {
    $('#floater').addClass('loading');
};

exports.getStationData = function (stationCode, socket) {

    $.ajax({
        url: '/central-line/' + stationCode + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },
        success: function(data) {
            exports.render(data);
            exports.resize();
            setTimeout(hideLoader, 500);
            listen(data.code, socket);
        }
    }).fail(function(e) {
        $('#floater .trains').html(templateError({stationCode: stationCode}));
        exports.resize();
        hideLoader();
    });
};

var stopListening = function(oldStation, socket) {
    console.log('stop listening', oldStation);
    socket.emit('next-train:station:listen:stop', oldStation);
    socket.off('next-train:station:' + oldStation);
};

exports.setup = function() {
    exports.bind($('#nextTrain'), socket);
};

// page changed.
exports.load = function(stationName, socket) {
    stopListening(exports.active, socket);
    exports.active = urlCodes[stationName];
    showLoader();
    exports.getStationData(stationName, socket);
};

// triggered by select drop down.
var stationChange = function(socket, e) {
    // woo hack! - should come from the json file.
    var newStationSlug = e.currentTarget.selectedOptions[0].label.replace(/ /g, '-').toLowerCase();
    page('/central-line/' + newStationSlug);
};

// renders the data, either from ws or http.
exports.render = function(data) {
    var $node = $('#nextTrain');
    if(exports.active !== data.code) {
        return false;
    }
    $node.find('select').attr('data-currently-listening', data.code);
    $('select').val(data.code);
    //$('body').scrollTop(0);
    // what data has changed here? how can we update only whats necessary and animate any
    // changes nicely?
    $node.find('.trains').replaceWith($(templateTrains({ station: data })));
    exports.resize();
};


exports.resize = function() {
    $('#floater').height($('.container').height());
};
// called on first page load.
exports.bind = function($node, socket) {
    var $select = $node.find('select#stationCode');
    $select.change(stationChange.bind(null, socket));
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    listen(newStation, socket);
};

}, {"../../public/libs/page.js":2,"./trains.jade":9,"./error.jade":10,"../../fetchers/next-train/url-codes.json":6}],
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

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
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

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
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
;var locals_for_with = (locals || {});(function (stationCode) {
buf.push("<div class=\"error\"><p>" + (jade.escape(null == (jade_interp = 'An error occured fetching ' + stationCode) ? "" : jade_interp)) + "</p></div>");}.call(this,"stationCode" in locals_for_with?locals_for_with.stationCode:typeof stationCode!=="undefined"?stationCode:undefined));;return buf.join("");
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
}, {}],
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
}, {"jade-runtime":8}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVpcmUuanMiLCJjbGllbnQvc2hhcmVkLmpzIiwicHVibGljL2xpYnMvcGFnZS5qcyIsImNvbXBvbmVudHMvbmV4dC1idXMvbmV4dC1idXMuanMiLCJjb21wb25lbnRzL25leHQtYnVzL25leHQtYnVzLmphZGUiLCJqYWRlLXJ1bnRpbWUiLCJjb21wb25lbnRzL25leHQtdHJhaW4vbmV4dC10cmFpbi5qcyIsImNvbXBvbmVudHMvbmV4dC10cmFpbi90cmFpbnMuamFkZSIsImNvbXBvbmVudHMvbmV4dC10cmFpbi9lcnJvci5qYWRlIiwiZmV0Y2hlcnMvbmV4dC10cmFpbi91cmwtY29kZXMuanNvbiIsImNvbXBvbmVudHMvdHJhaW4tc3RhdHVzL3RyYWluLXN0YXR1cy5qcyIsImNvbXBvbmVudHMvdHJhaW4tc3RhdHVzL3RyYWluLXN0YXR1cy5qYWRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIG91dGVyKG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKXtcblxuICAvKipcbiAgICogR2xvYmFsXG4gICAqL1xuXG4gIHZhciBnbG9iYWwgPSAoZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pKCk7XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYG5hbWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGp1bXBlZFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiByZXF1aXJlKG5hbWUsIGp1bXBlZCl7XG4gICAgaWYgKGNhY2hlW25hbWVdKSByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICBpZiAobW9kdWxlc1tuYW1lXSkgcmV0dXJuIGNhbGwobmFtZSwgcmVxdWlyZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgZmluZCBtb2R1bGUgXCInICsgbmFtZSArICdcIicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgbW9kdWxlIGBpZGAgYW5kIGNhY2hlIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcmVxdWlyZVxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGwoaWQsIHJlcXVpcmUpe1xuICAgIHZhciBtID0gY2FjaGVbaWRdID0geyBleHBvcnRzOiB7fSB9O1xuICAgIHZhciBtb2QgPSBtb2R1bGVzW2lkXTtcbiAgICB2YXIgbmFtZSA9IG1vZFsyXTtcbiAgICB2YXIgZm4gPSBtb2RbMF07XG5cbiAgICBmbi5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24ocmVxKXtcbiAgICAgIHZhciBkZXAgPSBtb2R1bGVzW2lkXVsxXVtyZXFdO1xuICAgICAgcmV0dXJuIHJlcXVpcmUoZGVwID8gZGVwIDogcmVxKTtcbiAgICB9LCBtLCBtLmV4cG9ydHMsIG91dGVyLCBtb2R1bGVzLCBjYWNoZSwgZW50cmllcyk7XG5cbiAgICAvLyBleHBvc2UgYXMgYG5hbWVgLlxuICAgIGlmIChuYW1lKSBjYWNoZVtuYW1lXSA9IGNhY2hlW2lkXTtcblxuICAgIHJldHVybiBjYWNoZVtpZF0uZXhwb3J0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1aXJlIGFsbCBlbnRyaWVzIGV4cG9zaW5nIHRoZW0gb24gZ2xvYmFsIGlmIG5lZWRlZC5cbiAgICovXG5cbiAgZm9yICh2YXIgaWQgaW4gZW50cmllcykge1xuICAgIGlmIChlbnRyaWVzW2lkXSkge1xuICAgICAgZ2xvYmFsW2VudHJpZXNbaWRdXSA9IHJlcXVpcmUoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1aXJlKGlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHVvIGZsYWcuXG4gICAqL1xuXG4gIHJlcXVpcmUuZHVvID0gdHJ1ZTtcblxuICAvKipcbiAgICogRXhwb3NlIGNhY2hlLlxuICAgKi9cblxuICByZXF1aXJlLmNhY2hlID0gY2FjaGU7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBtb2R1bGVzXG4gICAqL1xuXG4gIHJlcXVpcmUubW9kdWxlcyA9IG1vZHVsZXM7XG5cbiAgLyoqXG4gICAqIFJldHVybiBuZXdlc3QgcmVxdWlyZS5cbiAgICovXG5cbiAgIHJldHVybiByZXF1aXJlO1xufSkiLCJcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vcHVibGljL2xpYnMvcGFnZS5qcycpO1xudmFyIG5leHRCdXMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL25leHQtYnVzL25leHQtYnVzLmpzJyk7XG52YXIgbmV4dFRyYWluID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9uZXh0LXRyYWluL25leHQtdHJhaW4uanMnKTtcbnZhciB0cmFpblN0YXR1cyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdHJhaW4tc3RhdHVzL3RyYWluLXN0YXR1cy5qcycpO1xuXG52YXIgdXJsO1xuaWYod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSAnd29vZGZvcmQudG9kYXknKSB7XG4gICAgdXJsID0gJ2h0dHA6Ly93b29kZm9yZC50b2RheTo4MC8nO1xufWVsc2Uge1xuICAgIHVybCA9ICdodHRwOi8vbG9jYWxob3N0Lyc7XG59XG52YXIgc29ja2V0ID0gaW8odXJsKTtcblxubmV4dFRyYWluLmJpbmQoJCgnI25leHRUcmFpbicpLCBzb2NrZXQpO1xuXG5zb2NrZXQub24oJ3RyYWluU3RhdHVzJywgdHJhaW5TdGF0dXMucmVuZGVyKTtcbnNvY2tldC5vbignbmV4dEJ1cycsIG5leHRCdXMucmVuZGVyKTtcblxucGFnZSgpO1xuXG52YXIgc3RhdGlvbkNvZGVzID0gcmVxdWlyZSgnLi4vZmV0Y2hlcnMvbmV4dC10cmFpbi91cmwtY29kZXMuanNvbicpO1xuXG5wYWdlKCcvY2VudHJhbC1saW5lLzpzdGF0aW9uTmFtZScsIGZ1bmN0aW9uKGNvbnRleHQsIG5leHQpIHtcbiAgICBpZihjb250ZXh0LmluaXQpIHtcbiAgICAgICAgbmV4dFRyYWluLnNldHVwKGNvbnRleHQucGFyYW1zLnN0YXRpb25OYW1lLCBzb2NrZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb2RlID0gc3RhdGlvbkNvZGVzW2NvbnRleHQucGFyYW1zLnN0YXRpb25OYW1lXTtcbiAgICAgICAgbmV4dFRyYWluLmxvYWQoY29udGV4dC5wYXJhbXMuc3RhdGlvbk5hbWUsIHNvY2tldCk7XG4gICAgICAgICQoJyNtYXAtY29udGFpbmVyJykuYXR0cignZGF0YS1zdGF0aW9uJywgY29kZSk7XG4gICAgICAgICQoJ2xpIGEucG9pbnQnKS5yZW1vdmVDbGFzcygncG9pbnQnKTtcbiAgICAgICAgJCgndWwubGluZSBsaS4nICsgY29kZSArICcgYScpLmFkZENsYXNzKCdwb2ludCcpO1xuXG4gICAgfVxufSk7XG5cblxud2luZG93Lm9ucmVzaXplID0gbmV4dFRyYWluLnJlc2l6ZTtcbi8vICQoJyB1bCNjZW50cmFsLmxpbmUgbGkgYScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbi8vICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4vLyAgICAgdmFyIG5ld1N0YXRpb24gPSB0aGlzLmhyZWYuc3BsaXQoJy8nKS5wb3AoKTtcbi8vICAgICAkKCcjbWFwLWNvbnRhaW5lcicpLmF0dHIoJ2RhdGEtc3RhdGlvbicsIG5ld1N0YXRpb24pO1xuLy8gICAgIG5leHRUcmFpbi5nZXRTdGF0aW9uRGF0YShuZXdTdGF0aW9uLCBzb2NrZXQpO1xuLy8gfSk7XG4iLCIhZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSxlKTtlbHNle3ZhciBmO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/Zj13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9mPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKGY9c2VsZiksZi5wYWdlPWUoKX19KGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXG4gIC8qIGpzaGludCBicm93c2VyOnRydWUgKi9cblxuICAvKipcbiAgICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAgICovXG5cbiAgdmFyIHBhdGh0b1JlZ2V4cCA9IF9kZXJlcV8oJ3BhdGgtdG8tcmVnZXhwJyk7XG5cbiAgLyoqXG4gICAqIE1vZHVsZSBleHBvcnRzLlxuICAgKi9cblxuICBtb2R1bGUuZXhwb3J0cyA9IHBhZ2U7XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaC5cbiAgICovXG5cbiAgdmFyIGRpc3BhdGNoID0gdHJ1ZTtcblxuICAvKipcbiAgICogQmFzZSBwYXRoLlxuICAgKi9cblxuICB2YXIgYmFzZSA9ICcnO1xuXG4gIC8qKlxuICAgKiBSdW5uaW5nIGZsYWcuXG4gICAqL1xuXG4gIHZhciBydW5uaW5nO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBgcGF0aGAgd2l0aCBjYWxsYmFjayBgZm4oKWAsXG4gICAqIG9yIHJvdXRlIGBwYXRoYCwgb3IgYHBhZ2Uuc3RhcnQoKWAuXG4gICAqXG4gICAqICAgcGFnZShmbik7XG4gICAqICAgcGFnZSgnKicsIGZuKTtcbiAgICogICBwYWdlKCcvdXNlci86aWQnLCBsb2FkLCB1c2VyKTtcbiAgICogICBwYWdlKCcvdXNlci8nICsgdXNlci5pZCwgeyBzb21lOiAndGhpbmcnIH0pO1xuICAgKiAgIHBhZ2UoJy91c2VyLycgKyB1c2VyLmlkKTtcbiAgICogICBwYWdlKCk7XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBwYXRoXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuLi4uXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHBhZ2UocGF0aCwgZm4pIHtcbiAgICAvLyA8Y2FsbGJhY2s+XG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHJldHVybiBwYWdlKCcqJywgcGF0aCk7XG4gICAgfVxuXG4gICAgLy8gcm91dGUgPHBhdGg+IHRvIDxjYWxsYmFjayAuLi4+XG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGZuKSB7XG4gICAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUocGF0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBwYWdlLmNhbGxiYWNrcy5wdXNoKHJvdXRlLm1pZGRsZXdhcmUoYXJndW1lbnRzW2ldKSk7XG4gICAgICB9XG4gICAgLy8gc2hvdyA8cGF0aD4gd2l0aCBbc3RhdGVdXG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgcGF0aCkge1xuICAgICAgcGFnZS5zaG93KHBhdGgsIGZuKTtcbiAgICAvLyBzdGFydCBbb3B0aW9uc11cbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZS5zdGFydChwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb25zLlxuICAgKi9cblxuICBwYWdlLmNhbGxiYWNrcyA9IFtdO1xuXG4gIC8qKlxuICAgKiBHZXQgb3Igc2V0IGJhc2VwYXRoIHRvIGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5iYXNlID0gZnVuY3Rpb24ocGF0aCl7XG4gICAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJhc2U7XG4gICAgYmFzZSA9IHBhdGg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEJpbmQgd2l0aCB0aGUgZ2l2ZW4gYG9wdGlvbnNgLlxuICAgKlxuICAgKiBPcHRpb25zOlxuICAgKlxuICAgKiAgICAtIGBjbGlja2AgYmluZCB0byBjbGljayBldmVudHMgW3RydWVdXG4gICAqICAgIC0gYHBvcHN0YXRlYCBiaW5kIHRvIHBvcHN0YXRlIFt0cnVlXVxuICAgKiAgICAtIGBkaXNwYXRjaGAgcGVyZm9ybSBpbml0aWFsIGRpc3BhdGNoIFt0cnVlXVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnN0YXJ0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgaWYgKHJ1bm5pbmcpIHJldHVybjtcbiAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICBpZiAoZmFsc2UgPT09IG9wdGlvbnMuZGlzcGF0Y2gpIGRpc3BhdGNoID0gZmFsc2U7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLnBvcHN0YXRlKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvbnBvcHN0YXRlLCBmYWxzZSk7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLmNsaWNrKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgaWYgKCFkaXNwYXRjaCkgcmV0dXJuO1xuICAgIHZhciB1cmwgPSBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCArIGxvY2F0aW9uLmhhc2g7XG4gICAgcGFnZS5yZXBsYWNlKHVybCwgbnVsbCwgdHJ1ZSwgZGlzcGF0Y2gpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVbmJpbmQgY2xpY2sgYW5kIHBvcHN0YXRlIGV2ZW50IGhhbmRsZXJzLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uY2xpY2ssIGZhbHNlKTtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIG9ucG9wc3RhdGUsIGZhbHNlKTtcbiAgfTtcblxuICAvKipcbiAgICogU2hvdyBgcGF0aGAgd2l0aCBvcHRpb25hbCBgc3RhdGVgIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGlzcGF0Y2hcbiAgICogQHJldHVybiB7Q29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zaG93ID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGRpc3BhdGNoKXtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIGlmIChmYWxzZSAhPT0gZGlzcGF0Y2gpIHBhZ2UuZGlzcGF0Y2goY3R4KTtcbiAgICBpZiAoIWN0eC51bmhhbmRsZWQpIGN0eC5wdXNoU3RhdGUoKTtcbiAgICByZXR1cm4gY3R4O1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGBwYXRoYCB3aXRoIG9wdGlvbmFsIGBzdGF0ZWAgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGVcbiAgICogQHJldHVybiB7Q29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5yZXBsYWNlID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGluaXQsIGRpc3BhdGNoKXtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIGN0eC5pbml0ID0gaW5pdDtcbiAgICBpZiAobnVsbCA9PSBkaXNwYXRjaCkgZGlzcGF0Y2ggPSB0cnVlO1xuICAgIGlmIChkaXNwYXRjaCkgcGFnZS5kaXNwYXRjaChjdHgpO1xuICAgIGN0eC5zYXZlKCk7XG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2ggdGhlIGdpdmVuIGBjdHhgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY3R4XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBwYWdlLmRpc3BhdGNoID0gZnVuY3Rpb24oY3R4KXtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgdmFyIGZuID0gcGFnZS5jYWxsYmFja3NbaSsrXTtcbiAgICAgIGlmICghZm4pIHJldHVybiB1bmhhbmRsZWQoY3R4KTtcbiAgICAgIGZuKGN0eCwgbmV4dCk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVbmhhbmRsZWQgYGN0eGAuIFdoZW4gaXQncyBub3QgdGhlIGluaXRpYWxcbiAgICogcG9wc3RhdGUgdGhlbiByZWRpcmVjdC4gSWYgeW91IHdpc2ggdG8gaGFuZGxlXG4gICAqIDQwNHMgb24geW91ciBvd24gdXNlIGBwYWdlKCcqJywgY2FsbGJhY2spYC5cbiAgICpcbiAgICogQHBhcmFtIHtDb250ZXh0fSBjdHhcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHVuaGFuZGxlZChjdHgpIHtcbiAgICB2YXIgY3VycmVudCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gICAgaWYgKGN1cnJlbnQgPT0gY3R4LmNhbm9uaWNhbFBhdGgpIHJldHVybjtcbiAgICBwYWdlLnN0b3AoKTtcbiAgICBjdHgudW5oYW5kbGVkID0gdHJ1ZTtcbiAgICB3aW5kb3cubG9jYXRpb24gPSBjdHguY2Fub25pY2FsUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGEgbmV3IFwicmVxdWVzdFwiIGBDb250ZXh0YFxuICAgKiB3aXRoIHRoZSBnaXZlbiBgcGF0aGAgYW5kIG9wdGlvbmFsIGluaXRpYWwgYHN0YXRlYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIENvbnRleHQocGF0aCwgc3RhdGUpIHtcbiAgICBpZiAoJy8nID09IHBhdGhbMF0gJiYgMCAhPSBwYXRoLmluZGV4T2YoYmFzZSkpIHBhdGggPSBiYXNlICsgcGF0aDtcbiAgICB2YXIgaSA9IHBhdGguaW5kZXhPZignPycpO1xuXG4gICAgdGhpcy5jYW5vbmljYWxQYXRoID0gcGF0aDtcbiAgICB0aGlzLnBhdGggPSBwYXRoLnJlcGxhY2UoYmFzZSwgJycpIHx8ICcvJztcblxuICAgIHRoaXMudGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwge307XG4gICAgdGhpcy5zdGF0ZS5wYXRoID0gcGF0aDtcbiAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gfmkgPyBwYXRoLnNsaWNlKGkgKyAxKSA6ICcnO1xuICAgIHRoaXMucGF0aG5hbWUgPSB+aSA/IHBhdGguc2xpY2UoMCwgaSkgOiBwYXRoO1xuICAgIHRoaXMucGFyYW1zID0gW107XG5cbiAgICAvLyBmcmFnbWVudFxuICAgIHRoaXMuaGFzaCA9ICcnO1xuICAgIGlmICghfnRoaXMucGF0aC5pbmRleE9mKCcjJykpIHJldHVybjtcbiAgICB2YXIgcGFydHMgPSB0aGlzLnBhdGguc3BsaXQoJyMnKTtcbiAgICB0aGlzLnBhdGggPSBwYXJ0c1swXTtcbiAgICB0aGlzLmhhc2ggPSBwYXJ0c1sxXSB8fCAnJztcbiAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gdGhpcy5xdWVyeXN0cmluZy5zcGxpdCgnIycpWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBgQ29udGV4dGAuXG4gICAqL1xuXG4gIHBhZ2UuQ29udGV4dCA9IENvbnRleHQ7XG5cbiAgLyoqXG4gICAqIFB1c2ggc3RhdGUuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBDb250ZXh0LnByb3RvdHlwZS5wdXNoU3RhdGUgPSBmdW5jdGlvbigpe1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKHRoaXMuc3RhdGUsIHRoaXMudGl0bGUsIHRoaXMuY2Fub25pY2FsUGF0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNhdmUgdGhlIGNvbnRleHQgc3RhdGUuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIENvbnRleHQucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpe1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHRoaXMuc3RhdGUsIHRoaXMudGl0bGUsIHRoaXMuY2Fub25pY2FsUGF0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYFJvdXRlYCB3aXRoIHRoZSBnaXZlbiBIVFRQIGBwYXRoYCxcbiAgICogYW5kIGFuIGFycmF5IG9mIGBjYWxsYmFja3NgIGFuZCBgb3B0aW9uc2AuXG4gICAqXG4gICAqIE9wdGlvbnM6XG4gICAqXG4gICAqICAgLSBgc2Vuc2l0aXZlYCAgICBlbmFibGUgY2FzZS1zZW5zaXRpdmUgcm91dGVzXG4gICAqICAgLSBgc3RyaWN0YCAgICAgICBlbmFibGUgc3RyaWN0IG1hdGNoaW5nIGZvciB0cmFpbGluZyBzbGFzaGVzXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gUm91dGUocGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMucGF0aCA9IChwYXRoID09PSAnKicpID8gJyguKiknIDogcGF0aDtcbiAgICB0aGlzLm1ldGhvZCA9ICdHRVQnO1xuICAgIHRoaXMucmVnZXhwID0gcGF0aHRvUmVnZXhwKHRoaXMucGF0aFxuICAgICAgLCB0aGlzLmtleXMgPSBbXVxuICAgICAgLCBvcHRpb25zLnNlbnNpdGl2ZVxuICAgICAgLCBvcHRpb25zLnN0cmljdCk7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIGBSb3V0ZWAuXG4gICAqL1xuXG4gIHBhZ2UuUm91dGUgPSBSb3V0ZTtcblxuICAvKipcbiAgICogUmV0dXJuIHJvdXRlIG1pZGRsZXdhcmUgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gY2FsbGJhY2sgYGZuKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgUm91dGUucHJvdG90eXBlLm1pZGRsZXdhcmUgPSBmdW5jdGlvbihmbil7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihjdHgsIG5leHQpe1xuICAgICAgaWYgKHNlbGYubWF0Y2goY3R4LnBhdGgsIGN0eC5wYXJhbXMpKSByZXR1cm4gZm4oY3R4LCBuZXh0KTtcbiAgICAgIG5leHQoKTtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGlzIHJvdXRlIG1hdGNoZXMgYHBhdGhgLCBpZiBzb1xuICAgKiBwb3B1bGF0ZSBgcGFyYW1zYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtBcnJheX0gcGFyYW1zXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBSb3V0ZS5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihwYXRoLCBwYXJhbXMpe1xuICAgIHZhciBrZXlzID0gdGhpcy5rZXlzXG4gICAgICAsIHFzSW5kZXggPSBwYXRoLmluZGV4T2YoJz8nKVxuICAgICAgLCBwYXRobmFtZSA9IH5xc0luZGV4ID8gcGF0aC5zbGljZSgwLCBxc0luZGV4KSA6IHBhdGhcbiAgICAgICwgbSA9IHRoaXMucmVnZXhwLmV4ZWMoZGVjb2RlVVJJQ29tcG9uZW50KHBhdGhuYW1lKSk7XG5cbiAgICBpZiAoIW0pIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAxLCBsZW4gPSBtLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpIC0gMV07XG5cbiAgICAgIHZhciB2YWwgPSAnc3RyaW5nJyA9PSB0eXBlb2YgbVtpXVxuICAgICAgICA/IGRlY29kZVVSSUNvbXBvbmVudChtW2ldKVxuICAgICAgICA6IG1baV07XG5cbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgcGFyYW1zW2tleS5uYW1lXSA9IHVuZGVmaW5lZCAhPT0gcGFyYW1zW2tleS5uYW1lXVxuICAgICAgICAgID8gcGFyYW1zW2tleS5uYW1lXVxuICAgICAgICAgIDogdmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyYW1zLnB1c2godmFsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlIFwicG9wdWxhdGVcIiBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9ucG9wc3RhdGUoZSkge1xuICAgIGlmIChlLnN0YXRlKSB7XG4gICAgICB2YXIgcGF0aCA9IGUuc3RhdGUucGF0aDtcbiAgICAgIHBhZ2UucmVwbGFjZShwYXRoLCBlLnN0YXRlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIFwiY2xpY2tcIiBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uY2xpY2soZSkge1xuICAgIGlmICgxICE9IHdoaWNoKGUpKSByZXR1cm47XG4gICAgaWYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgIGlmIChlLmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcblxuICAgIC8vIGVuc3VyZSBsaW5rXG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgd2hpbGUgKGVsICYmICdBJyAhPSBlbC5ub2RlTmFtZSkgZWwgPSBlbC5wYXJlbnROb2RlO1xuICAgIGlmICghZWwgfHwgJ0EnICE9IGVsLm5vZGVOYW1lKSByZXR1cm47XG5cbiAgICAvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcbiAgICB2YXIgbGluayA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgIGlmIChlbC5wYXRobmFtZSA9PSBsb2NhdGlvbi5wYXRobmFtZSAmJiAoZWwuaGFzaCB8fCAnIycgPT0gbGluaykpIHJldHVybjtcblxuICAgIC8vIENoZWNrIGZvciBtYWlsdG86IGluIHRoZSBocmVmXG4gICAgaWYgKGxpbmsuaW5kZXhPZihcIm1haWx0bzpcIikgPiAtMSkgcmV0dXJuO1xuXG4gICAgLy8gY2hlY2sgdGFyZ2V0XG4gICAgaWYgKGVsLnRhcmdldCkgcmV0dXJuO1xuXG4gICAgLy8geC1vcmlnaW5cbiAgICBpZiAoIXNhbWVPcmlnaW4oZWwuaHJlZikpIHJldHVybjtcblxuICAgIC8vIHJlYnVpbGQgcGF0aFxuICAgIHZhciBwYXRoID0gZWwucGF0aG5hbWUgKyBlbC5zZWFyY2ggKyAoZWwuaGFzaCB8fCAnJyk7XG5cbiAgICAvLyBzYW1lIHBhZ2VcbiAgICB2YXIgb3JpZyA9IHBhdGggKyBlbC5oYXNoO1xuXG4gICAgcGF0aCA9IHBhdGgucmVwbGFjZShiYXNlLCAnJyk7XG4gICAgaWYgKGJhc2UgJiYgb3JpZyA9PSBwYXRoKSByZXR1cm47XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcGFnZS5zaG93KG9yaWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGJ1dHRvbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gd2hpY2goZSkge1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICByZXR1cm4gbnVsbCA9PSBlLndoaWNoXG4gICAgICA/IGUuYnV0dG9uXG4gICAgICA6IGUud2hpY2g7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGhyZWZgIGlzIHRoZSBzYW1lIG9yaWdpbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2FtZU9yaWdpbihocmVmKSB7XG4gICAgdmFyIG9yaWdpbiA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3RuYW1lO1xuICAgIGlmIChsb2NhdGlvbi5wb3J0KSBvcmlnaW4gKz0gJzonICsgbG9jYXRpb24ucG9ydDtcbiAgICByZXR1cm4gMCA9PSBocmVmLmluZGV4T2Yob3JpZ2luKTtcbiAgfVxuXG59LHtcInBhdGgtdG8tcmVnZXhwXCI6Mn1dLDI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4gKiBFeHBvc2UgYHBhdGh0b1JlZ2V4cGAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gcGF0aHRvUmVnZXhwO1xuXG52YXIgUEFUSF9SRUdFWFAgPSBuZXcgUmVnRXhwKFtcbiAgLy8gTWF0Y2ggYWxyZWFkeSBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgaW5jb3JyZWN0bHkgYXBwZWFyXG4gIC8vIGluIGZ1dHVyZSBtYXRjaGVzLiBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXRcbiAgLy8gc2hvdWxkbid0IGJlIHRyYW5zZm9ybWVkLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiXVxuICAvLyBcIi9yb3V0ZShcXFxcZCspXCIgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWRdXG4gICcoW1xcXFwvLl0pPyg/OlxcXFw6KFxcXFx3KykoPzpcXFxcKCgoPzpcXFxcXFxcXC58W14pXSkqKVxcXFwpKT98XFxcXCgoKD86XFxcXFxcXFwufFteKV0pKilcXFxcKSkoWysqP10pPycsXG4gIC8vIE1hdGNoIHJlZ2V4cCBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYWx3YXlzIGJlIGVzY2FwZWQuXG4gICcoWy4rKj89XiE6JHt9KClbXFxcXF18XFxcXC9dKSdcbl0uam9pbignfCcpLCAnZycpO1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgY2FwdHVyaW5nIGdyb3VwIGJ5IGVzY2FwaW5nIHNwZWNpYWwgY2hhcmFjdGVycyBhbmQgbWVhbmluZy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGdyb3VwXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZUdyb3VwIChncm91cCkge1xuICByZXR1cm4gZ3JvdXAucmVwbGFjZSgvKFs9ITokXFwvKCldKS9nLCAnXFxcXCQxJyk7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiBwYXRoIHN0cmluZywgcmV0dXJuaW5nIGEgcmVndWxhciBleHByZXNzaW9uLlxuICpcbiAqIEFuIGVtcHR5IGFycmF5IHNob3VsZCBiZSBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgY29udGFpbiB0aGUgcGxhY2Vob2xkZXIga2V5XG4gKiBuYW1lcy4gRm9yIGV4YW1wbGUgYC91c2VyLzppZGAgd2lsbCB0aGVuIGNvbnRhaW4gYFtcImlkXCJdYC5cbiAqXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cHxBcnJheSl9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICAgICAgICAgICAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSAgICAgICAgICAgICAgICBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHBhdGh0b1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICBrZXlzID0ga2V5cyB8fCBbXTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0O1xuICB2YXIgZW5kID0gb3B0aW9ucy5lbmQgIT09IGZhbHNlO1xuICB2YXIgZmxhZ3MgPSBvcHRpb25zLnNlbnNpdGl2ZSA/ICcnIDogJ2knO1xuICB2YXIgaW5kZXggPSAwO1xuXG4gIGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgLy8gTWF0Y2ggYWxsIGNhcHR1cmluZyBncm91cHMgb2YgYSByZWdleHAuXG4gICAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpIHx8IFtdO1xuXG4gICAgLy8gTWFwIGFsbCB0aGUgbWF0Y2hlcyB0byB0aGVpciBudW1lcmljIGtleXMgYW5kIHB1c2ggaW50byB0aGUga2V5cy5cbiAgICBrZXlzLnB1c2guYXBwbHkoa2V5cywgZ3JvdXBzLm1hcChmdW5jdGlvbiAobWF0Y2gsIGluZGV4KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAgICAgIGluZGV4LFxuICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgIG9wdGlvbmFsOiAgZmFsc2UsXG4gICAgICAgIHJlcGVhdDogICAgZmFsc2VcbiAgICAgIH07XG4gICAgfSkpO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBzb3VyY2UgYmFjayB0byB0aGUgdXNlci5cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHBhdGgpKSB7XG4gICAgLy8gTWFwIGFycmF5IHBhcnRzIGludG8gcmVnZXhwcyBhbmQgcmV0dXJuIHRoZWlyIHNvdXJjZS4gV2UgYWxzbyBwYXNzXG4gICAgLy8gdGhlIHNhbWUga2V5cyBhbmQgb3B0aW9ucyBpbnN0YW5jZSBpbnRvIGV2ZXJ5IGdlbmVyYXRpb24gdG8gZ2V0XG4gICAgLy8gY29uc2lzdGVudCBtYXRjaGluZyBncm91cHMgYmVmb3JlIHdlIGpvaW4gdGhlIHNvdXJjZXMgdG9nZXRoZXIuXG4gICAgcGF0aCA9IHBhdGgubWFwKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHBhdGh0b1JlZ2V4cCh2YWx1ZSwga2V5cywgb3B0aW9ucykuc291cmNlO1xuICAgIH0pO1xuXG4gICAgLy8gR2VuZXJhdGUgYSBuZXcgcmVnZXhwIGluc3RhbmNlIGJ5IGpvaW5pbmcgYWxsIHRoZSBwYXJ0cyB0b2dldGhlci5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnKD86JyArIHBhdGguam9pbignfCcpICsgJyknLCBmbGFncyk7XG4gIH1cblxuICAvLyBBbHRlciB0aGUgcGF0aCBzdHJpbmcgaW50byBhIHVzYWJsZSByZWdleHAuXG4gIHBhdGggPSBwYXRoLnJlcGxhY2UoUEFUSF9SRUdFWFAsIGZ1bmN0aW9uIChtYXRjaCwgZXNjYXBlZCwgcHJlZml4LCBrZXksIGNhcHR1cmUsIGdyb3VwLCBzdWZmaXgsIGVzY2FwZSkge1xuICAgIC8vIEF2b2lkaW5nIHJlLWVzY2FwaW5nIGVzY2FwZWQgY2hhcmFjdGVycy5cbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgcmV0dXJuIGVzY2FwZWQ7XG4gICAgfVxuXG4gICAgLy8gRXNjYXBlIHJlZ2V4cCBzcGVjaWFsIGNoYXJhY3RlcnMuXG4gICAgaWYgKGVzY2FwZSkge1xuICAgICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZTtcbiAgICB9XG5cbiAgICB2YXIgcmVwZWF0ICAgPSBzdWZmaXggPT09ICcrJyB8fCBzdWZmaXggPT09ICcqJztcbiAgICB2YXIgb3B0aW9uYWwgPSBzdWZmaXggPT09ICc/JyB8fCBzdWZmaXggPT09ICcqJztcblxuICAgIGtleXMucHVzaCh7XG4gICAgICBuYW1lOiAgICAgIGtleSB8fCBpbmRleCsrLFxuICAgICAgZGVsaW1pdGVyOiBwcmVmaXggfHwgJy8nLFxuICAgICAgb3B0aW9uYWw6ICBvcHRpb25hbCxcbiAgICAgIHJlcGVhdDogICAgcmVwZWF0XG4gICAgfSk7XG5cbiAgICAvLyBFc2NhcGUgdGhlIHByZWZpeCBjaGFyYWN0ZXIuXG4gICAgcHJlZml4ID0gcHJlZml4ID8gJ1xcXFwnICsgcHJlZml4IDogJyc7XG5cbiAgICAvLyBNYXRjaCB1c2luZyB0aGUgY3VzdG9tIGNhcHR1cmluZyBncm91cCwgb3IgZmFsbGJhY2sgdG8gY2FwdHVyaW5nXG4gICAgLy8gZXZlcnl0aGluZyB1cCB0byB0aGUgbmV4dCBzbGFzaCAob3IgbmV4dCBwZXJpb2QgaWYgdGhlIHBhcmFtIHdhc1xuICAgIC8vIHByZWZpeGVkIHdpdGggYSBwZXJpb2QpLlxuICAgIGNhcHR1cmUgPSBlc2NhcGVHcm91cChjYXB0dXJlIHx8IGdyb3VwIHx8ICdbXicgKyAocHJlZml4IHx8ICdcXFxcLycpICsgJ10rPycpO1xuXG4gICAgLy8gQWxsb3cgcGFyYW1ldGVycyB0byBiZSByZXBlYXRlZCBtb3JlIHRoYW4gb25jZS5cbiAgICBpZiAocmVwZWF0KSB7XG4gICAgICBjYXB0dXJlID0gY2FwdHVyZSArICcoPzonICsgcHJlZml4ICsgY2FwdHVyZSArICcpKic7XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgYSBwYXJhbWV0ZXIgdG8gYmUgb3B0aW9uYWwuXG4gICAgaWYgKG9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gJyg/OicgKyBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJykpPyc7XG4gICAgfVxuXG4gICAgLy8gQmFzaWMgcGFyYW1ldGVyIHN1cHBvcnQuXG4gICAgcmV0dXJuIHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSc7XG4gIH0pO1xuXG4gIC8vIENoZWNrIHdoZXRoZXIgdGhlIHBhdGggZW5kcyBpbiBhIHNsYXNoIGFzIGl0IGFsdGVycyBzb21lIG1hdGNoIGJlaGF2aW91ci5cbiAgdmFyIGVuZHNXaXRoU2xhc2ggPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV0gPT09ICcvJztcblxuICAvLyBJbiBub24tc3RyaWN0IG1vZGUgd2UgYWxsb3cgYW4gb3B0aW9uYWwgdHJhaWxpbmcgc2xhc2ggaW4gdGhlIG1hdGNoLiBJZlxuICAvLyB0aGUgcGF0aCB0byBtYXRjaCBhbHJlYWR5IGVuZGVkIHdpdGggYSBzbGFzaCwgd2UgbmVlZCB0byByZW1vdmUgaXQgZm9yXG4gIC8vIGNvbnNpc3RlbmN5LiBUaGUgc2xhc2ggaXMgb25seSB2YWxpZCBhdCB0aGUgdmVyeSBlbmQgb2YgYSBwYXRoIG1hdGNoLCBub3RcbiAgLy8gYW55d2hlcmUgaW4gdGhlIG1pZGRsZS4gVGhpcyBpcyBpbXBvcnRhbnQgZm9yIG5vbi1lbmRpbmcgbW9kZSwgb3RoZXJ3aXNlXG4gIC8vIFwiL3Rlc3QvXCIgd2lsbCBtYXRjaCBcIi90ZXN0Ly9yb3V0ZVwiLlxuICBpZiAoIXN0cmljdCkge1xuICAgIHBhdGggPSAoZW5kc1dpdGhTbGFzaCA/IHBhdGguc2xpY2UoMCwgLTIpIDogcGF0aCkgKyAnKD86XFxcXC8oPz0kKSk/JztcbiAgfVxuXG4gIC8vIEluIG5vbi1lbmRpbmcgbW9kZSwgd2UgbmVlZCBwcm9tcHQgdGhlIGNhcHR1cmluZyBncm91cHMgdG8gbWF0Y2ggYXMgbXVjaFxuICAvLyBhcyBwb3NzaWJsZSBieSB1c2luZyBhIHBvc2l0aXZlIGxvb2thaGVhZCBmb3IgdGhlIGVuZCBvciBuZXh0IHBhdGggc2VnbWVudC5cbiAgaWYgKCFlbmQpIHtcbiAgICBwYXRoICs9IHN0cmljdCAmJiBlbmRzV2l0aFNsYXNoID8gJycgOiAnKD89XFxcXC98JCknO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgcGF0aCArIChlbmQgPyAnJCcgOiAnJyksIGZsYWdzKTtcbn07XG5cbn0se31dfSx7fSxbMV0pXG4oMSlcbn0pO1xuIiwidmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9uZXh0LWJ1cy5qYWRlJyk7XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICQoJyNuZXh0QnVzJykucmVwbGFjZVdpdGgodGVtcGxhdGUoeyAnbmV4dEJ1cyc6IGRhdGEgfSkpO1xufTtcbiIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS1ydW50aW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChuZXh0QnVzKSB7XG5idWYucHVzaChcIjxkaXYgaWQ9XFxcIm5leHRCdXNcXFwiPjxoMj5CdXNlczwvaDI+PGRpdiBjbGFzcz1cXFwiZGlyZWN0aW9uXFxcIj48aDM+VG8gQmFya2luZ3NpZGU8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG5pZiAoIG5leHRCdXNbJzEnXSlcbntcbi8vIGl0ZXJhdGUgbmV4dEJ1c1snMSddLmJ1c2VzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG5leHRCdXNbJzEnXS5idXNlcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cXFwiZGlyZWN0aW9uXFxcIj48aDM+VG8gV2FsdGhhbXN0b3c8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG5pZiAoIG5leHRCdXNbJzInXSlcbntcbi8vIGl0ZXJhdGUgbmV4dEJ1c1snMiddLmJ1c2VzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG5leHRCdXNbJzInXS5idXNlcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGJ1cyA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gYnVzLmR1ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PC9kaXY+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwibmV4dEJ1c1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubmV4dEJ1czp0eXBlb2YgbmV4dEJ1cyE9PVwidW5kZWZpbmVkXCI/bmV4dEJ1czp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCIhZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShlKTtlbHNle3ZhciBmO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/Zj13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9mPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKGY9c2VsZiksZi5qYWRlPWUoKX19KGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxyXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxyXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxyXG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXHJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xyXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF0dHJzO1xyXG4gIH1cclxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xyXG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XHJcblxyXG4gIGlmIChhYyB8fCBiYykge1xyXG4gICAgYWMgPSBhYyB8fCBbXTtcclxuICAgIGJjID0gYmMgfHwgW107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XHJcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIga2V5IGluIGIpIHtcclxuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xyXG4gICAgICBhW2tleV0gPSBiW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xyXG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xyXG59XHJcblxyXG4vKipcclxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XHJcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xyXG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKSA6IHZhbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cclxuICpcclxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xyXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XHJcbiAgdmFyIGJ1ZiA9IFtdO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xyXG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcclxuICBpZiAodGV4dC5sZW5ndGgpIHtcclxuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcclxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcclxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcclxuICAgIGlmICh2YWwpIHtcclxuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xyXG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcclxuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcclxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcclxuICB2YXIgYnVmID0gW107XHJcblxyXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcclxuXHJcbiAgaWYgKGtleXMubGVuZ3RoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGtleSA9IGtleXNbaV1cclxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xyXG5cclxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XHJcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcclxuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBidWYuam9pbignJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xyXG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbClcclxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xyXG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XHJcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxyXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cclxuICpcclxuICogQHBhcmFtIHtFcnJvcn0gZXJyXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xyXG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xyXG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcclxuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xyXG4gICAgdGhyb3cgZXJyO1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgc3RyID0gc3RyIHx8IF9kZXJlcV8oJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXHJcbiAgfSBjYXRjaCAoZXgpIHtcclxuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXHJcbiAgfVxyXG4gIHZhciBjb250ZXh0ID0gM1xyXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcclxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxyXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xyXG5cclxuICAvLyBFcnJvciBjb250ZXh0XHJcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XHJcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XHJcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxyXG4gICAgICArIGN1cnJcclxuICAgICAgKyAnfCAnXHJcbiAgICAgICsgbGluZTtcclxuICB9KS5qb2luKCdcXG4nKTtcclxuXHJcbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcclxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xyXG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cclxuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcclxuICB0aHJvdyBlcnI7XHJcbn07XHJcblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSlcbigxKVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uLy4uL3B1YmxpYy9saWJzL3BhZ2UuanMnKTtcbnZhciB0ZW1wbGF0ZVRyYWlucyA9IHJlcXVpcmUoJy4vdHJhaW5zLmphZGUnKTtcbnZhciB0ZW1wbGF0ZUVycm9yID0gcmVxdWlyZSgnLi9lcnJvci5qYWRlJyk7XG4vL3ZhciB0ZW1wbGF0ZVRpdGxlID0gcmVxdWlyZSgnLi90aXRsZS5qYWRlJyk7XG52YXIgdXJsQ29kZXMgPSByZXF1aXJlKCcuLi8uLi9mZXRjaGVycy9uZXh0LXRyYWluL3VybC1jb2Rlcy5qc29uJyk7XG5cbnZhciBsaXN0ZW4gPSBmdW5jdGlvbiAobmV3U3RhdGlvbiwgc29ja2V0KSB7XG4gICAgY29uc29sZS5sb2coJ2xpc3RlbicsIG5ld1N0YXRpb24pO1xuICAgIHNvY2tldC5lbWl0KCduZXh0LXRyYWluOnN0YXRpb246bGlzdGVuOnN0YXJ0JywgbmV3U3RhdGlvbik7XG4gICAgc29ja2V0Lm9uKCduZXh0LXRyYWluOnN0YXRpb246JyArIG5ld1N0YXRpb24sIGV4cG9ydHMucmVuZGVyKTtcbn07XG5cbnZhciBoaWRlTG9hZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgJCgnI2Zsb2F0ZXInKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xufTtcblxudmFyIHNob3dMb2FkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkKCcjZmxvYXRlcicpLmFkZENsYXNzKCdsb2FkaW5nJyk7XG59O1xuXG5leHBvcnRzLmdldFN0YXRpb25EYXRhID0gZnVuY3Rpb24gKHN0YXRpb25Db2RlLCBzb2NrZXQpIHtcblxuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogJy9jZW50cmFsLWxpbmUvJyArIHN0YXRpb25Db2RlICsgJz9hamF4PXRydWUnICxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZXhwb3J0cy5yZW5kZXIoZGF0YSk7XG4gICAgICAgICAgICBleHBvcnRzLnJlc2l6ZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChoaWRlTG9hZGVyLCA1MDApO1xuICAgICAgICAgICAgbGlzdGVuKGRhdGEuY29kZSwgc29ja2V0KTtcbiAgICAgICAgfVxuICAgIH0pLmZhaWwoZnVuY3Rpb24oZSkge1xuICAgICAgICAkKCcjZmxvYXRlciAudHJhaW5zJykuaHRtbCh0ZW1wbGF0ZUVycm9yKHtzdGF0aW9uQ29kZTogc3RhdGlvbkNvZGV9KSk7XG4gICAgICAgIGV4cG9ydHMucmVzaXplKCk7XG4gICAgICAgIGhpZGVMb2FkZXIoKTtcbiAgICB9KTtcbn07XG5cbnZhciBzdG9wTGlzdGVuaW5nID0gZnVuY3Rpb24ob2xkU3RhdGlvbiwgc29ja2V0KSB7XG4gICAgY29uc29sZS5sb2coJ3N0b3AgbGlzdGVuaW5nJywgb2xkU3RhdGlvbik7XG4gICAgc29ja2V0LmVtaXQoJ25leHQtdHJhaW46c3RhdGlvbjpsaXN0ZW46c3RvcCcsIG9sZFN0YXRpb24pO1xuICAgIHNvY2tldC5vZmYoJ25leHQtdHJhaW46c3RhdGlvbjonICsgb2xkU3RhdGlvbik7XG59O1xuXG5leHBvcnRzLnNldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgZXhwb3J0cy5iaW5kKCQoJyNuZXh0VHJhaW4nKSwgc29ja2V0KTtcbn07XG5cbi8vIHBhZ2UgY2hhbmdlZC5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKHN0YXRpb25OYW1lLCBzb2NrZXQpIHtcbiAgICBzdG9wTGlzdGVuaW5nKGV4cG9ydHMuYWN0aXZlLCBzb2NrZXQpO1xuICAgIGV4cG9ydHMuYWN0aXZlID0gdXJsQ29kZXNbc3RhdGlvbk5hbWVdO1xuICAgIHNob3dMb2FkZXIoKTtcbiAgICBleHBvcnRzLmdldFN0YXRpb25EYXRhKHN0YXRpb25OYW1lLCBzb2NrZXQpO1xufTtcblxuLy8gdHJpZ2dlcmVkIGJ5IHNlbGVjdCBkcm9wIGRvd24uXG52YXIgc3RhdGlvbkNoYW5nZSA9IGZ1bmN0aW9uKHNvY2tldCwgZSkge1xuICAgIC8vIHdvbyBoYWNrISAtIHNob3VsZCBjb21lIGZyb20gdGhlIGpzb24gZmlsZS5cbiAgICB2YXIgbmV3U3RhdGlvblNsdWcgPSBlLmN1cnJlbnRUYXJnZXQuc2VsZWN0ZWRPcHRpb25zWzBdLmxhYmVsLnJlcGxhY2UoLyAvZywgJy0nKS50b0xvd2VyQ2FzZSgpO1xuICAgIHBhZ2UoJy9jZW50cmFsLWxpbmUvJyArIG5ld1N0YXRpb25TbHVnKTtcbn07XG5cbi8vIHJlbmRlcnMgdGhlIGRhdGEsIGVpdGhlciBmcm9tIHdzIG9yIGh0dHAuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgJG5vZGUgPSAkKCcjbmV4dFRyYWluJyk7XG4gICAgaWYoZXhwb3J0cy5hY3RpdmUgIT09IGRhdGEuY29kZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgICRub2RlLmZpbmQoJ3NlbGVjdCcpLmF0dHIoJ2RhdGEtY3VycmVudGx5LWxpc3RlbmluZycsIGRhdGEuY29kZSk7XG4gICAgJCgnc2VsZWN0JykudmFsKGRhdGEuY29kZSk7XG4gICAgLy8kKCdib2R5Jykuc2Nyb2xsVG9wKDApO1xuICAgIC8vIHdoYXQgZGF0YSBoYXMgY2hhbmdlZCBoZXJlPyBob3cgY2FuIHdlIHVwZGF0ZSBvbmx5IHdoYXRzIG5lY2Vzc2FyeSBhbmQgYW5pbWF0ZSBhbnlcbiAgICAvLyBjaGFuZ2VzIG5pY2VseT9cbiAgICAkbm9kZS5maW5kKCcudHJhaW5zJykucmVwbGFjZVdpdGgoJCh0ZW1wbGF0ZVRyYWlucyh7IHN0YXRpb246IGRhdGEgfSkpKTtcbiAgICBleHBvcnRzLnJlc2l6ZSgpO1xufTtcblxuXG5leHBvcnRzLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICQoJyNmbG9hdGVyJykuaGVpZ2h0KCQoJy5jb250YWluZXInKS5oZWlnaHQoKSk7XG59O1xuLy8gY2FsbGVkIG9uIGZpcnN0IHBhZ2UgbG9hZC5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKCRub2RlLCBzb2NrZXQpIHtcbiAgICB2YXIgJHNlbGVjdCA9ICRub2RlLmZpbmQoJ3NlbGVjdCNzdGF0aW9uQ29kZScpO1xuICAgICRzZWxlY3QuY2hhbmdlKHN0YXRpb25DaGFuZ2UuYmluZChudWxsLCBzb2NrZXQpKTtcbiAgICB2YXIgbmV3U3RhdGlvbiA9ICRzZWxlY3QuZGF0YSgnY3VycmVudGx5TGlzdGVuaW5nJyk7XG4gICAgZXhwb3J0cy5hY3RpdmUgPSBuZXdTdGF0aW9uO1xuICAgIGxpc3RlbihuZXdTdGF0aW9uLCBzb2NrZXQpO1xufTtcbiIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS1ydW50aW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChzdGF0aW9uKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInRyYWluc1xcXCI+XCIpO1xudmFyIG5vVHJhaW5zID0gdHJ1ZTtcbmlmICggc3RhdGlvbilcbntcbi8vIGl0ZXJhdGUgc3RhdGlvbi50cmFpbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc3RhdGlvbi50cmFpbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBkaXJlY3Rpb24gPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGRpcmVjdGlvbiA8ICQkbDsgZGlyZWN0aW9uKyspIHtcbiAgICAgIHZhciB0cmFpbnMgPSAkJG9ialtkaXJlY3Rpb25dO1xuXG5pZiAoIHRyYWlucy5sZW5ndGggPiAwKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJkaXJlY3Rpb25cXFwiPjxoMz5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGRpcmVjdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48dWwgY2xhc3M9XFxcInRyYWluc1xcXCI+XCIpO1xuLy8gaXRlcmF0ZSB0cmFpbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gdHJhaW5zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgJGluZGV4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyAkaW5kZXggPCAkJGw7ICRpbmRleCsrKSB7XG4gICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PCEtLWEoaHJlZj0nL2NlbnRyYWwtbGluZS8nICsgdHJhaW4uZGVzdGluYXRpb24ucmVwbGFjZSgvIC9nLCAnLScpLnRvTG93ZXJDYXNlKCkpLS0+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGJyLz48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaT48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PCEtLWEoaHJlZj0nL2NlbnRyYWwtbGluZS8nICsgdHJhaW4uZGVzdGluYXRpb24ucmVwbGFjZSgvIC9nLCAnLScpLnRvTG93ZXJDYXNlKCkpLS0+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGJyLz48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj5cIik7XG5ub1RyYWlucyA9IGZhbHNlO1xufVxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGRpcmVjdGlvbiBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHRyYWlucyA9ICQkb2JqW2RpcmVjdGlvbl07XG5cbmlmICggdHJhaW5zLmxlbmd0aCA+IDApXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImRpcmVjdGlvblxcXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZGlyZWN0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjx1bCBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG4vLyBpdGVyYXRlIHRyYWluc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSB0cmFpbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48IS0tYShocmVmPScvY2VudHJhbC1saW5lLycgKyB0cmFpbi5kZXN0aW5hdGlvbi5yZXBsYWNlKC8gL2csICctJykudG9Mb3dlckNhc2UoKSktLT48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48YnIvPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48IS0tYShocmVmPScvY2VudHJhbC1saW5lLycgKyB0cmFpbi5kZXN0aW5hdGlvbi5yZXBsYWNlKC8gL2csICctJykudG9Mb3dlckNhc2UoKSktLT48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48YnIvPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PlwiKTtcbm5vVHJhaW5zID0gZmFsc2U7XG59XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmlmICggbm9UcmFpbnMpXG57XG5idWYucHVzaChcIjxoMyBjbGFzcz1cXFwibm9UcmFpbnNcXFwiPk5vIFRyYWluczwvaDM+XCIpO1xufVxuYnVmLnB1c2goXCI8L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJzdGF0aW9uXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zdGF0aW9uOnR5cGVvZiBzdGF0aW9uIT09XCJ1bmRlZmluZWRcIj9zdGF0aW9uOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS1ydW50aW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChzdGF0aW9uQ29kZSkge1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJlcnJvclxcXCI+PHA+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSAnQW4gZXJyb3Igb2NjdXJlZCBmZXRjaGluZyAnICsgc3RhdGlvbkNvZGUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvcD48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJzdGF0aW9uQ29kZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc3RhdGlvbkNvZGU6dHlwZW9mIHN0YXRpb25Db2RlIT09XCJ1bmRlZmluZWRcIj9zdGF0aW9uQ29kZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJiYW5rXCI6IFwiQk5LXCIsXG4gIFwiYmFya2luZ3NpZGVcIjogXCJCREVcIixcbiAgXCJiZXRobmFsLWdyZWVuXCI6IFwiQk5HXCIsXG4gIFwiYm9uZC1zdHJlZXRcIjogXCJCRFNcIixcbiAgXCJidWNraHVyc3QtaGlsbFwiOiBcIkJITFwiLFxuICBcImNoYW5jZXJ5LWxhbmVcIjogXCJDWUxcIixcbiAgXCJjaGlnd2VsbFwiOiBcIkNIR1wiLFxuICBcImRlYmRlblwiOiBcIkRFQlwiLFxuICBcImVhbGluZy1icm9hZHdheVwiOiBcIkVCWVwiLFxuICBcImVhc3QtYWN0b25cIjogXCJFQUNcIixcbiAgXCJlcHBpbmdcIjogXCJFUFBcIixcbiAgXCJmYWlybG9wXCI6IFwiRkxQXCIsXG4gIFwiZ2FudHMtaGlsbFwiOiBcIkdITFwiLFxuICBcImdyYW5nZS1oaWxsXCI6IFwiR1JIXCIsXG4gIFwiZ3JlZW5mb3JkXCI6IFwiR0ZEXCIsXG4gIFwiaGFpbmF1bHRcIjogXCJIQUlcIixcbiAgXCJoYW5nZXItbGFuZVwiOiBcIkhMTlwiLFxuICBcImhvbGJvcm5cIjogXCJIT0xcIixcbiAgXCJob2xsYW5kLXBhcmtcIjogXCJIUEtcIixcbiAgXCJsYW5jYXN0ZXItZ2F0ZVwiOiBcIkxBTlwiLFxuICBcImxleXRvblwiOiBcIkxFWVwiLFxuICBcImxleXRvbnN0b25lXCI6IFwiTFlTXCIsXG4gIFwibGl2ZXJwb29sLXN0cmVldFwiOiBcIkxTVFwiLFxuICBcImxvdWdodG9uXCI6IFwiTFROXCIsXG4gIFwibWFyYmxlLWFyY2hcIjogXCJNQVJcIixcbiAgXCJtaWxlLWVuZFwiOiBcIk1MRVwiLFxuICBcIm5ld2J1cnktcGFya1wiOiBcIk5FUFwiLFxuICBcIm5vcnRoLWFjdG9uXCI6IFwiTkFDXCIsXG4gIFwibm9ydGhvbHRcIjogXCJOSFRcIixcbiAgXCJub3R0aW5nLWhpbGwtZ2F0ZVwiOiBcIk5IR1wiLFxuICBcIm94Zm9yZC1jaXJjdXNcIjogXCJPWENcIixcbiAgXCJwZXJpdmFsZVwiOiBcIlBFUlwiLFxuICBcInF1ZWVuc3dheVwiOiBcIlFXWVwiLFxuICBcInJlZGJyaWRnZVwiOiBcIlJFRFwiLFxuICBcInJvZGluZy12YWxsZXlcIjogXCJST0RcIixcbiAgXCJydWlzbGlwLWdhcmRlbnNcIjogXCJSVUdcIixcbiAgXCJzaGVwaGVyZHMtYnVzaFwiOiBcIlNCQ1wiLFxuICBcInNuYXJlc2Jyb29rXCI6IFwiU05CXCIsXG4gIFwic291dGgtcnVpc2xpcFwiOiBcIlNSUFwiLFxuICBcInNvdXRoLXdvb2Rmb3JkXCI6IFwiU1dGXCIsXG4gIFwic3QtcGF1bHNcIjogXCJTVFBcIixcbiAgXCJzdHJhdGZvcmRcIjogXCJTRkRcIixcbiAgXCJ0aGV5ZG9uLWJvaXNcIjogXCJUSEJcIixcbiAgXCJ0b3R0ZW5oYW0tY291cnQtcm9hZFwiOiBcIlRDUlwiLFxuICBcIndhbnN0ZWFkXCI6IFwiV0FOXCIsXG4gIFwid2VzdC1hY3RvblwiOiBcIldBQ1wiLFxuICBcIndlc3QtcnVpc2xpcFwiOiBcIldSUFwiLFxuICBcIndoaXRlLWNpdHlcIjogXCJXQ1RcIixcbiAgXCJ3b29kZm9yZFwiOiBcIldGRFwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90cmFpbi1zdGF0dXMuamFkZScpO1xuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgY29uc29sZS5sb2coJ3RyYWluIHN0YXR1cycpXG4gICQoJyN0ZmxTdGF0dXMnKS5yZXBsYWNlV2l0aCh0ZW1wbGF0ZSh7ICd0ZmxTdGF0dXMnOiBkYXRhIH0pKTtcbn07XG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUtcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAodGZsU3RhdHVzLCBjb3VudCwgUmVnRXhwKSB7XG5pZiAoIHRmbFN0YXR1cylcbntcbmJ1Zi5wdXNoKFwiPGRpdiBpZD1cXFwidGZsU3RhdHVzXFxcIj48dWw+XCIpO1xuY291bnQgPSAwO1xuLy8gaXRlcmF0ZSB0ZmxTdGF0dXNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gdGZsU3RhdHVzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgJGluZGV4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyAkaW5kZXggPCAkJGw7ICRpbmRleCsrKSB7XG4gICAgICB2YXIgc3RhdHVzID0gJCRvYmpbJGluZGV4XTtcblxuaWYgKCBzdGF0dXMuU3RhdHVzRGV0YWlscyE9PScnKVxue1xudmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnICcsIFwiZ1wiKVxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbJ2xpbmUgJytzdGF0dXMuTGluZS5OYW1lLnJlcGxhY2UocmVnZXgsICcnKV0sIFt0cnVlXSkpICsgXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc3RhdHVzLkxpbmUuTmFtZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48ZGl2PlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc3RhdHVzLlN0YXR1c0RldGFpbHMpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvZGl2PlwiKTtcbmNvdW50KytcbmJ1Zi5wdXNoKFwiPC9saT5cIik7XG59XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgc3RhdHVzID0gJCRvYmpbJGluZGV4XTtcblxuaWYgKCBzdGF0dXMuU3RhdHVzRGV0YWlscyE9PScnKVxue1xudmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnICcsIFwiZ1wiKVxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbJ2xpbmUgJytzdGF0dXMuTGluZS5OYW1lLnJlcGxhY2UocmVnZXgsICcnKV0sIFt0cnVlXSkpICsgXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc3RhdHVzLkxpbmUuTmFtZSkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48ZGl2PlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc3RhdHVzLlN0YXR1c0RldGFpbHMpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvZGl2PlwiKTtcbmNvdW50KytcbmJ1Zi5wdXNoKFwiPC9saT5cIik7XG59XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmlmICggY291bnQgPT09IDApXG57XG5idWYucHVzaChcIjxkaXY+QWxsIGxpbmVzIG9wZXJhdGlvbmFsLjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj5cIik7XG59fS5jYWxsKHRoaXMsXCJ0ZmxTdGF0dXNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnRmbFN0YXR1czp0eXBlb2YgdGZsU3RhdHVzIT09XCJ1bmRlZmluZWRcIj90ZmxTdGF0dXM6dW5kZWZpbmVkLFwiY291bnRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNvdW50OnR5cGVvZiBjb3VudCE9PVwidW5kZWZpbmVkXCI/Y291bnQ6dW5kZWZpbmVkLFwiUmVnRXhwXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5SZWdFeHA6dHlwZW9mIFJlZ0V4cCE9PVwidW5kZWZpbmVkXCI/UmVnRXhwOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyJdfQ==