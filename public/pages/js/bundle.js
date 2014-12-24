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
'use strict';


// internal browser events bus.
var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});

// router
var page = require('../../public/libs/page.js');
var urlCodes = require('../../fetchers/next-train/url-codes.json');

var $mapContainer = $('#map-container');
var $floater = $('#floater');
[
    {
        $el: $mapContainer,
        events: require('../../components/tubes/tubes.js')
    },
    {
        $el: $floater,
        events: require('../../components/floater/floater.js')
    },
    {
        $el: $floater.find('#station'),
        events: require('../../components/station/station.js')
    },
    {
        $el: $floater.find('select'),
        events: require('../../components/station-switcher/station-switcher.js')
    }
].forEach(function(component) {
    component.events.init && component.events.init(component.$el, bus);
    for (var ev in component.events) {
        bus.on(ev, function(ev, events) {
            // strip args added for bind and create array.
            var mainArguments = Array.prototype.slice.call(arguments, 2);
            // add $el and bus.
            mainArguments.push(component.$el, bus);
            // apply with modified arguments.
            events[ev].apply(null, mainArguments);
        }.bind(null, ev, component.events));
    }
});


function listen(station, socket) {
    console.log('listen called', station.code);
    socket.emit('station:listen:start', station.code);
    socket.on('station:' + station.code + ':change', function(changes) {
        changes.forEach(function(change) {

            if(change.parent) {
                //console.log('trigger', change.parent, change);
                // chagne is not goin through
                bus.trigger(change.parent, change);
            }
        });
        // changes.forEach(function(change) {
        //     if (change.change === 'value changed' ) {
        //         bus.emit();
        //     }
        // });
    });
};

var stopListening = function(oldStation, socket) {
    console.log('stop listen called', oldStation.code);
    socket.emit('station:listen:stop', oldStation.code);
    socket.off('station:' + oldStation.code);
};


bus.on('page:load', function(path) {
    page(path);
});

bus.on('station', function(station) {
    stopListening(station, socket);
});
bus.on('nextTrain:gotStationData', function(station) {
    listen(station, socket);
});


var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
} else {
    url = 'http://localhost/';
}


var socket = io(url);

page();

console.log('000');

page('/central/:stationName', function(context) {
    bus.trigger('station', {
        slug: context.params.stationName,
        code: urlCodes[context.params.stationName]
    });
});

// window.onresize = function() {};

}, {"../../node_modules/backbone-events-standalone":2,"../../public/libs/page.js":3,"../../fetchers/next-train/url-codes.json":4,"../../components/tubes/tubes.js":5,"../../components/floater/floater.js":6,"../../components/station/station.js":7,"../../components/station-switcher/station-switcher.js":8}],
2: [function(require, module, exports) {
module.exports = require('./backbone-events-standalone');

}, {"./backbone-events-standalone":9}],
9: [function(require, module, exports) {
/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 */
/* global exports:true, define, module */
(function() {
  var root = this,
      breaker = {},
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

  // Returns a partial implementation matching the minimal API subset required
  // by Backbone.Events
  function miniscore() {
    return {
      keys: Object.keys || function (obj) {
        if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
          throw new TypeError("keys() called on a non-object");
        }
        var key, keys = [];
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys[keys.length] = key;
          }
        }
        return keys;
      },

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          for (var key in obj) {
            if (this.has(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) return;
            }
          }
        }
      },

      once: function(func) {
        var ran = false, memo;
        return function() {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      }
    };
  }

  var _ = miniscore(), Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function(proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                   'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function(name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  // Export Events as BackboneEvents depending on current context
  if (typeof define === "function") {
    define(function() {
      return Events;
    });
  } else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Events;
    }
    exports.BackboneEvents = Events;
  } else {
    root.BackboneEvents = Events;
  }
})(this);

}, {}],
3: [function(require, module, exports) {
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
4: [function(require, module, exports) {
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
module.exports = {
    'station' : focus
};

function focus(station, $el) {
    $el.attr('data-station', station.code);
    $el.find('li.active').removeClass('active');
    $('html, body').animate({scrollTop : 0}, 500);
    $('li.' + station.code ).addClass('active');
    setTimeout(function() {
        $('ul.line li  a.point').removeClass('point');
        $('ul.line li.' + station.code + ' a').addClass('point');
    }, 1250);
};
}, {}],
6: [function(require, module, exports) {
'use strict';

function hideLoader($el) {
    console.log('hide loader');
    $el.removeClass('loading');
}

function showLoader($el) {
    console.log('show loader');
    $el.addClass('loading');
}

function resize($el) {
    $el.height($el.find('.container').height());
    //$('#floater').width($('.container').width());
}

module.exports = {
    'loader:show': showLoader,
    'loader:hide': hideLoader,
    'resize': resize
};

}, {}],
7: [function(require, module, exports) {
'use strict';

// component functionality includes.
var direction = require('../direction/direction');

// template includes
var templateError = require('../station/error.jade');
var templateTrains = require('../station/trains.jade');


//var stationCodes = require('../../fetchers/')

module.exports = {
    'init': init,
    'station': getStationData,
    'nextTrain:gotStationData': render
};

function init($el, bus) {
    var $select = $el.find('select');
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    directionInit($el, bus);
}

function directionInit($el, bus) {
    $el.find('[data-direction]').each(function() {
        direction.init(this.dataset.direction, $(this), bus);
    });
}

function render(data, $el, bus) {
    return;
    var $select = $el.find('select');
    $select.attr('data-currently-listening', data.code);
    $select.val(data.code);
    $el.find('.error').empty();
    $el.find('.trains').html($(templateTrains({
        station: data
    })));
    directionInit($el, bus);
    bus.trigger('resize');
}

function getStationData(station, $el, bus) {
    $.ajax({
        url: '/central/' + station.slug + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },
        complete: function(xhr, status) {
            console.log('complete', status)
            if(status === 'error') {
                errorCallback(station.slug, $el, bus);
            }
        },
        success: function(data) {
            bus.trigger('nextTrain:gotStationData', data);
        }
    });
}

function errorCallback(stationCode, $el, bus) {
    console.log('ERROR CALLBACK');
    $el.find('.trains').empty();
    $el.find('.error').html(templateError({stationCode: stationCode}));
    bus.trigger('resize');
    bus.trigger('loader:hide');
}


}, {"../direction/direction":10,"../station/error.jade":11,"../station/trains.jade":12}],
10: [function(require, module, exports) {
'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');

var trainTemplate = require('../train/train.jade');


exports.init = function(direction, $el, bus) {
    bus.on('WFD.trains.' + direction, function(data) {
        if(data.change === "item removed from list") {
            // todo - animate out here
            $el.find('li[data-id='+data.item + ']').remove();
        } else if(data.newValue) { // new item added.
            var newTrainMarkup = trainTemplate({
                train: data.newValue
            });
            $el.find('ul').append(newTrainMarkup);
        }
    });
};


function listChange(direction, $el, bus, data) {

}

function removeTrain() {
    alert('remove train');
}
}, {"../train/train":13,"../train/train.jade":14}],
13: [function(require, module, exports) {
// property updated

exports.init = function($el, bus) {
    console.log('init train');

};
}, {}],
14: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (train) {
buf.push("<li" + (jade.attr("data-id", train.id, true, false)) + " class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");}.call(this,"train" in locals_for_with?locals_for_with.train:typeof train!=="undefined"?train:undefined));;return buf.join("");
};
}, {"jade-runtime":15}],
15: [function(require, module, exports) {
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
11: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (stationCode) {
buf.push("<div class=\"error trains\"><h2>Ooops</h2><div class=\"detail\">Something Went wrong. you can try refreshing the page, or maybe pop back later.<p>" + (jade.escape(null == (jade_interp = 'An error occured fetching ' + stationCode) ? "" : jade_interp)) + "</p></div><hr/></div>");}.call(this,"stationCode" in locals_for_with?locals_for_with.stationCode:typeof stationCode!=="undefined"?stationCode:undefined));;return buf.join("");
};
}, {"jade-runtime":15}],
12: [function(require, module, exports) {
var jade = require('jade-runtime');

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (station) {
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
buf.push("<div class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = direction) ? "" : jade_interp)) + "</h3><ul" + (jade.attr("data-direction", direction, true, false)) + " class=\"trains\">");
// iterate trains
;(function(){
  var $$obj = trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

buf.push("<li class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
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
buf.push("<div class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = direction) ? "" : jade_interp)) + "</h3><ul" + (jade.attr("data-direction", direction, true, false)) + " class=\"trains\">");
// iterate trains
;(function(){
  var $$obj = trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

buf.push("<li class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

buf.push("<li class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
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
}}.call(this,"station" in locals_for_with?locals_for_with.station:typeof station!=="undefined"?station:undefined));;return buf.join("");
};
}, {"jade-runtime":15}],
8: [function(require, module, exports) {
'use strict';

function init($el, bus) {
    $el.change(function(e) {
        var newStationSlug = e.currentTarget.selectedOptions[0].label.replace(/ /g, '-').toLowerCase();
        bus.trigger('page:load', '/central/' + newStationSlug);
    });
}


module.exports = {
    init: init
};

}, {}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVpcmUuanMiLCJwYWdlcy9zdGF0aW9uL3N0YXRpb24uanMiLCJub2RlX21vZHVsZXMvYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmUvYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmUuanMiLCJwdWJsaWMvbGlicy9wYWdlLmpzIiwiZmV0Y2hlcnMvbmV4dC10cmFpbi91cmwtY29kZXMuanNvbiIsImNvbXBvbmVudHMvdHViZXMvdHViZXMuanMiLCJjb21wb25lbnRzL2Zsb2F0ZXIvZmxvYXRlci5qcyIsImNvbXBvbmVudHMvc3RhdGlvbi9zdGF0aW9uLmpzIiwiY29tcG9uZW50cy9kaXJlY3Rpb24vZGlyZWN0aW9uLmpzIiwiY29tcG9uZW50cy90cmFpbi90cmFpbi5qcyIsImNvbXBvbmVudHMvdHJhaW4vdHJhaW4uamFkZSIsImphZGUtcnVudGltZSIsImNvbXBvbmVudHMvc3RhdGlvbi9lcnJvci5qYWRlIiwiY29tcG9uZW50cy9zdGF0aW9uL3RyYWlucy5qYWRlIiwiY29tcG9uZW50cy9zdGF0aW9uLXN3aXRjaGVyL3N0YXRpb24tc3dpdGNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6R0E7QUFDQTs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDclJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaGpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gb3V0ZXIobW9kdWxlcywgY2FjaGUsIGVudHJpZXMpe1xuXG4gIC8qKlxuICAgKiBHbG9iYWxcbiAgICovXG5cbiAgdmFyIGdsb2JhbCA9IChmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSkoKTtcblxuICAvKipcbiAgICogUmVxdWlyZSBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0ganVtcGVkXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICBpZiAoY2FjaGVbbmFtZV0pIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIGlmIChtb2R1bGVzW25hbWVdKSByZXR1cm4gY2FsbChuYW1lLCByZXF1aXJlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBmaW5kIG1vZHVsZSBcIicgKyBuYW1lICsgJ1wiJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBtb2R1bGUgYGlkYCBhbmQgY2FjaGUgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXF1aXJlXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gY2FsbChpZCwgcmVxdWlyZSl7XG4gICAgdmFyIG0gPSBjYWNoZVtpZF0gPSB7IGV4cG9ydHM6IHt9IH07XG4gICAgdmFyIG1vZCA9IG1vZHVsZXNbaWRdO1xuICAgIHZhciBuYW1lID0gbW9kWzJdO1xuICAgIHZhciBmbiA9IG1vZFswXTtcblxuICAgIGZuLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbihyZXEpe1xuICAgICAgdmFyIGRlcCA9IG1vZHVsZXNbaWRdWzFdW3JlcV07XG4gICAgICByZXR1cm4gcmVxdWlyZShkZXAgPyBkZXAgOiByZXEpO1xuICAgIH0sIG0sIG0uZXhwb3J0cywgb3V0ZXIsIG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKTtcblxuICAgIC8vIGV4cG9zZSBhcyBgbmFtZWAuXG4gICAgaWYgKG5hbWUpIGNhY2hlW25hbWVdID0gY2FjaGVbaWRdO1xuXG4gICAgcmV0dXJuIGNhY2hlW2lkXS5leHBvcnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYWxsIGVudHJpZXMgZXhwb3NpbmcgdGhlbSBvbiBnbG9iYWwgaWYgbmVlZGVkLlxuICAgKi9cblxuICBmb3IgKHZhciBpZCBpbiBlbnRyaWVzKSB7XG4gICAgaWYgKGVudHJpZXNbaWRdKSB7XG4gICAgICBnbG9iYWxbZW50cmllc1tpZF1dID0gcmVxdWlyZShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVpcmUoaWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEdW8gZmxhZy5cbiAgICovXG5cbiAgcmVxdWlyZS5kdW8gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY2FjaGUuXG4gICAqL1xuXG4gIHJlcXVpcmUuY2FjaGUgPSBjYWNoZTtcblxuICAvKipcbiAgICogRXhwb3NlIG1vZHVsZXNcbiAgICovXG5cbiAgcmVxdWlyZS5tb2R1bGVzID0gbW9kdWxlcztcblxuICAvKipcbiAgICogUmV0dXJuIG5ld2VzdCByZXF1aXJlLlxuICAgKi9cblxuICAgcmV0dXJuIHJlcXVpcmU7XG59KSIsIid1c2Ugc3RyaWN0JztcblxuXG4vLyBpbnRlcm5hbCBicm93c2VyIGV2ZW50cyBidXMuXG52YXIgYnVzID0gd2luZG93LmJ1cyA9IHJlcXVpcmUoXCIuLi8uLi9ub2RlX21vZHVsZXMvYmFja2JvbmUtZXZlbnRzLXN0YW5kYWxvbmVcIikubWl4aW4oe30pO1xuXG4vLyByb3V0ZXJcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vLi4vcHVibGljL2xpYnMvcGFnZS5qcycpO1xudmFyIHVybENvZGVzID0gcmVxdWlyZSgnLi4vLi4vZmV0Y2hlcnMvbmV4dC10cmFpbi91cmwtY29kZXMuanNvbicpO1xuXG52YXIgJG1hcENvbnRhaW5lciA9ICQoJyNtYXAtY29udGFpbmVyJyk7XG52YXIgJGZsb2F0ZXIgPSAkKCcjZmxvYXRlcicpO1xuW1xuICAgIHtcbiAgICAgICAgJGVsOiAkbWFwQ29udGFpbmVyLFxuICAgICAgICBldmVudHM6IHJlcXVpcmUoJy4uLy4uL2NvbXBvbmVudHMvdHViZXMvdHViZXMuanMnKVxuICAgIH0sXG4gICAge1xuICAgICAgICAkZWw6ICRmbG9hdGVyLFxuICAgICAgICBldmVudHM6IHJlcXVpcmUoJy4uLy4uL2NvbXBvbmVudHMvZmxvYXRlci9mbG9hdGVyLmpzJylcbiAgICB9LFxuICAgIHtcbiAgICAgICAgJGVsOiAkZmxvYXRlci5maW5kKCcjc3RhdGlvbicpLFxuICAgICAgICBldmVudHM6IHJlcXVpcmUoJy4uLy4uL2NvbXBvbmVudHMvc3RhdGlvbi9zdGF0aW9uLmpzJylcbiAgICB9LFxuICAgIHtcbiAgICAgICAgJGVsOiAkZmxvYXRlci5maW5kKCdzZWxlY3QnKSxcbiAgICAgICAgZXZlbnRzOiByZXF1aXJlKCcuLi8uLi9jb21wb25lbnRzL3N0YXRpb24tc3dpdGNoZXIvc3RhdGlvbi1zd2l0Y2hlci5qcycpXG4gICAgfVxuXS5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgIGNvbXBvbmVudC5ldmVudHMuaW5pdCAmJiBjb21wb25lbnQuZXZlbnRzLmluaXQoY29tcG9uZW50LiRlbCwgYnVzKTtcbiAgICBmb3IgKHZhciBldiBpbiBjb21wb25lbnQuZXZlbnRzKSB7XG4gICAgICAgIGJ1cy5vbihldiwgZnVuY3Rpb24oZXYsIGV2ZW50cykge1xuICAgICAgICAgICAgLy8gc3RyaXAgYXJncyBhZGRlZCBmb3IgYmluZCBhbmQgY3JlYXRlIGFycmF5LlxuICAgICAgICAgICAgdmFyIG1haW5Bcmd1bWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgICAgICAgICAgLy8gYWRkICRlbCBhbmQgYnVzLlxuICAgICAgICAgICAgbWFpbkFyZ3VtZW50cy5wdXNoKGNvbXBvbmVudC4kZWwsIGJ1cyk7XG4gICAgICAgICAgICAvLyBhcHBseSB3aXRoIG1vZGlmaWVkIGFyZ3VtZW50cy5cbiAgICAgICAgICAgIGV2ZW50c1tldl0uYXBwbHkobnVsbCwgbWFpbkFyZ3VtZW50cyk7XG4gICAgICAgIH0uYmluZChudWxsLCBldiwgY29tcG9uZW50LmV2ZW50cykpO1xuICAgIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIGxpc3RlbihzdGF0aW9uLCBzb2NrZXQpIHtcbiAgICBjb25zb2xlLmxvZygnbGlzdGVuIGNhbGxlZCcsIHN0YXRpb24uY29kZSk7XG4gICAgc29ja2V0LmVtaXQoJ3N0YXRpb246bGlzdGVuOnN0YXJ0Jywgc3RhdGlvbi5jb2RlKTtcbiAgICBzb2NrZXQub24oJ3N0YXRpb246JyArIHN0YXRpb24uY29kZSArICc6Y2hhbmdlJywgZnVuY3Rpb24oY2hhbmdlcykge1xuICAgICAgICBjaGFuZ2VzLmZvckVhY2goZnVuY3Rpb24oY2hhbmdlKSB7XG5cbiAgICAgICAgICAgIGlmKGNoYW5nZS5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCd0cmlnZ2VyJywgY2hhbmdlLnBhcmVudCwgY2hhbmdlKTtcbiAgICAgICAgICAgICAgICAvLyBjaGFnbmUgaXMgbm90IGdvaW4gdGhyb3VnaFxuICAgICAgICAgICAgICAgIGJ1cy50cmlnZ2VyKGNoYW5nZS5wYXJlbnQsIGNoYW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBjaGFuZ2VzLmZvckVhY2goZnVuY3Rpb24oY2hhbmdlKSB7XG4gICAgICAgIC8vICAgICBpZiAoY2hhbmdlLmNoYW5nZSA9PT0gJ3ZhbHVlIGNoYW5nZWQnICkge1xuICAgICAgICAvLyAgICAgICAgIGJ1cy5lbWl0KCk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuICAgIH0pO1xufTtcblxudmFyIHN0b3BMaXN0ZW5pbmcgPSBmdW5jdGlvbihvbGRTdGF0aW9uLCBzb2NrZXQpIHtcbiAgICBjb25zb2xlLmxvZygnc3RvcCBsaXN0ZW4gY2FsbGVkJywgb2xkU3RhdGlvbi5jb2RlKTtcbiAgICBzb2NrZXQuZW1pdCgnc3RhdGlvbjpsaXN0ZW46c3RvcCcsIG9sZFN0YXRpb24uY29kZSk7XG4gICAgc29ja2V0Lm9mZignc3RhdGlvbjonICsgb2xkU3RhdGlvbi5jb2RlKTtcbn07XG5cblxuYnVzLm9uKCdwYWdlOmxvYWQnLCBmdW5jdGlvbihwYXRoKSB7XG4gICAgcGFnZShwYXRoKTtcbn0pO1xuXG5idXMub24oJ3N0YXRpb24nLCBmdW5jdGlvbihzdGF0aW9uKSB7XG4gICAgc3RvcExpc3RlbmluZyhzdGF0aW9uLCBzb2NrZXQpO1xufSk7XG5idXMub24oJ25leHRUcmFpbjpnb3RTdGF0aW9uRGF0YScsIGZ1bmN0aW9uKHN0YXRpb24pIHtcbiAgICBsaXN0ZW4oc3RhdGlvbiwgc29ja2V0KTtcbn0pO1xuXG5cbnZhciB1cmw7XG5pZih3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09ICd3b29kZm9yZC50b2RheScpIHtcbiAgICB1cmwgPSAnaHR0cDovL3dvb2Rmb3JkLnRvZGF5OjgwLyc7XG59IGVsc2Uge1xuICAgIHVybCA9ICdodHRwOi8vbG9jYWxob3N0Lyc7XG59XG5cblxudmFyIHNvY2tldCA9IGlvKHVybCk7XG5cbnBhZ2UoKTtcblxuY29uc29sZS5sb2coJzAwMCcpO1xuXG5wYWdlKCcvY2VudHJhbC86c3RhdGlvbk5hbWUnLCBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgYnVzLnRyaWdnZXIoJ3N0YXRpb24nLCB7XG4gICAgICAgIHNsdWc6IGNvbnRleHQucGFyYW1zLnN0YXRpb25OYW1lLFxuICAgICAgICBjb2RlOiB1cmxDb2Rlc1tjb250ZXh0LnBhcmFtcy5zdGF0aW9uTmFtZV1cbiAgICB9KTtcbn0pO1xuXG4vLyB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbigpIHt9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2JhY2tib25lLWV2ZW50cy1zdGFuZGFsb25lJyk7XG4iLCIvKipcbiAqIFN0YW5kYWxvbmUgZXh0cmFjdGlvbiBvZiBCYWNrYm9uZS5FdmVudHMsIG5vIGV4dGVybmFsIGRlcGVuZGVuY3kgcmVxdWlyZWQuXG4gKiBEZWdyYWRlcyBuaWNlbHkgd2hlbiBCYWNrb25lL3VuZGVyc2NvcmUgYXJlIGFscmVhZHkgYXZhaWxhYmxlIGluIHRoZSBjdXJyZW50XG4gKiBnbG9iYWwgY29udGV4dC5cbiAqXG4gKiBOb3RlIHRoYXQgZG9jcyBzdWdnZXN0IHRvIHVzZSB1bmRlcnNjb3JlJ3MgYF8uZXh0ZW5kKClgIG1ldGhvZCB0byBhZGQgRXZlbnRzXG4gKiBzdXBwb3J0IHRvIHNvbWUgZ2l2ZW4gb2JqZWN0LiBBIGBtaXhpbigpYCBtZXRob2QgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIEV2ZW50c1xuICogcHJvdG90eXBlIHRvIGF2b2lkIHVzaW5nIHVuZGVyc2NvcmUgZm9yIHRoYXQgc29sZSBwdXJwb3NlOlxuICpcbiAqICAgICB2YXIgbXlFdmVudEVtaXR0ZXIgPSBCYWNrYm9uZUV2ZW50cy5taXhpbih7fSk7XG4gKlxuICogT3IgZm9yIGEgZnVuY3Rpb24gY29uc3RydWN0b3I6XG4gKlxuICogICAgIGZ1bmN0aW9uIE15Q29uc3RydWN0b3IoKXt9XG4gKiAgICAgTXlDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZm9vID0gZnVuY3Rpb24oKXt9XG4gKiAgICAgQmFja2JvbmVFdmVudHMubWl4aW4oTXlDb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICpcbiAqIChjKSAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIEluYy5cbiAqIChjKSAyMDEzIE5pY29sYXMgUGVycmlhdWx0XG4gKi9cbi8qIGdsb2JhbCBleHBvcnRzOnRydWUsIGRlZmluZSwgbW9kdWxlICovXG4oZnVuY3Rpb24oKSB7XG4gIHZhciByb290ID0gdGhpcyxcbiAgICAgIGJyZWFrZXIgPSB7fSxcbiAgICAgIG5hdGl2ZUZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCxcbiAgICAgIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLFxuICAgICAgaWRDb3VudGVyID0gMDtcblxuICAvLyBSZXR1cm5zIGEgcGFydGlhbCBpbXBsZW1lbnRhdGlvbiBtYXRjaGluZyB0aGUgbWluaW1hbCBBUEkgc3Vic2V0IHJlcXVpcmVkXG4gIC8vIGJ5IEJhY2tib25lLkV2ZW50c1xuICBmdW5jdGlvbiBtaW5pc2NvcmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleXM6IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG9iaiAhPT0gXCJmdW5jdGlvblwiIHx8IG9iaiA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJrZXlzKCkgY2FsbGVkIG9uIGEgbm9uLW9iamVjdFwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIga2V5LCBrZXlzID0gW107XG4gICAgICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAga2V5c1trZXlzLmxlbmd0aF0gPSBrZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgfSxcblxuICAgICAgdW5pcXVlSWQ6IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgICAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgICAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgICAgIH0sXG5cbiAgICAgIGhhczogZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICAgICAgfSxcblxuICAgICAgZWFjaDogZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgICBpZiAob2JqID09IG51bGwpIHJldHVybjtcbiAgICAgICAgaWYgKG5hdGl2ZUZvckVhY2ggJiYgb2JqLmZvckVhY2ggPT09IG5hdGl2ZUZvckVhY2gpIHtcbiAgICAgICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICAgIH0gZWxzZSBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXMob2JqLCBrZXkpKSB7XG4gICAgICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIG9uY2U6IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgdmFyIHJhbiA9IGZhbHNlLCBtZW1vO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHJhbikgcmV0dXJuIG1lbW87XG4gICAgICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB2YXIgXyA9IG1pbmlzY29yZSgpLCBFdmVudHM7XG5cbiAgLy8gQmFja2JvbmUuRXZlbnRzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEEgbW9kdWxlIHRoYXQgY2FuIGJlIG1peGVkIGluIHRvICphbnkgb2JqZWN0KiBpbiBvcmRlciB0byBwcm92aWRlIGl0IHdpdGhcbiAgLy8gY3VzdG9tIGV2ZW50cy4gWW91IG1heSBiaW5kIHdpdGggYG9uYCBvciByZW1vdmUgd2l0aCBgb2ZmYCBjYWxsYmFja1xuICAvLyBmdW5jdGlvbnMgdG8gYW4gZXZlbnQ7IGB0cmlnZ2VyYC1pbmcgYW4gZXZlbnQgZmlyZXMgYWxsIGNhbGxiYWNrcyBpblxuICAvLyBzdWNjZXNzaW9uLlxuICAvL1xuICAvLyAgICAgdmFyIG9iamVjdCA9IHt9O1xuICAvLyAgICAgXy5leHRlbmQob2JqZWN0LCBCYWNrYm9uZS5FdmVudHMpO1xuICAvLyAgICAgb2JqZWN0Lm9uKCdleHBhbmQnLCBmdW5jdGlvbigpeyBhbGVydCgnZXhwYW5kZWQnKTsgfSk7XG4gIC8vICAgICBvYmplY3QudHJpZ2dlcignZXhwYW5kJyk7XG4gIC8vXG4gIEV2ZW50cyA9IHtcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLiBQYXNzaW5nIGBcImFsbFwiYCB3aWxsIGJpbmRcbiAgICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbiAgICBvbjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbicsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV0gfHwgKHRoaXMuX2V2ZW50c1tuYW1lXSA9IFtdKTtcbiAgICAgIGV2ZW50cy5wdXNoKHtjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQsIGN0eDogY29udGV4dCB8fCB0aGlzfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAgIC8vIHRoZSBjYWxsYmFjayBpcyBpbnZva2VkLCBpdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgb25jZTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbmNlJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBvbmNlID0gXy5vbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLm9mZihuYW1lLCBvbmNlKTtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0pO1xuICAgICAgb25jZS5fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIG9uY2UsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgb25lIG9yIG1hbnkgY2FsbGJhY2tzLiBJZiBgY29udGV4dGAgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3Mgd2l0aCB0aGF0IGZ1bmN0aW9uLiBJZiBgY2FsbGJhY2tgIGlzIG51bGwsIHJlbW92ZXMgYWxsXG4gICAgLy8gY2FsbGJhY2tzIGZvciB0aGUgZXZlbnQuIElmIGBuYW1lYCBpcyBudWxsLCByZW1vdmVzIGFsbCBib3VuZFxuICAgIC8vIGNhbGxiYWNrcyBmb3IgYWxsIGV2ZW50cy5cbiAgICBvZmY6IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmV0YWluLCBldiwgZXZlbnRzLCBuYW1lcywgaSwgbCwgaiwgaztcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzIHx8ICFldmVudHNBcGkodGhpcywgJ29mZicsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pKSByZXR1cm4gdGhpcztcbiAgICAgIGlmICghbmFtZSAmJiAhY2FsbGJhY2sgJiYgIWNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBuYW1lcyA9IG5hbWUgPyBbbmFtZV0gOiBfLmtleXModGhpcy5fZXZlbnRzKTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICBpZiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW25hbWVdID0gcmV0YWluID0gW107XG4gICAgICAgICAgaWYgKGNhbGxiYWNrIHx8IGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICAgIGV2ID0gZXZlbnRzW2pdO1xuICAgICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2suX2NhbGxiYWNrKSB8fFxuICAgICAgICAgICAgICAgICAgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gZXYuY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFyZXRhaW4ubGVuZ3RoKSBkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuIENhbGxiYWNrcyBhcmVcbiAgICAvLyBwYXNzZWQgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGB0cmlnZ2VyYCBpcywgYXBhcnQgZnJvbSB0aGUgZXZlbnQgbmFtZVxuICAgIC8vICh1bmxlc3MgeW91J3JlIGxpc3RlbmluZyBvbiBgXCJhbGxcImAsIHdoaWNoIHdpbGwgY2F1c2UgeW91ciBjYWxsYmFjayB0b1xuICAgIC8vIHJlY2VpdmUgdGhlIHRydWUgbmFtZSBvZiB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50KS5cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICd0cmlnZ2VyJywgbmFtZSwgYXJncykpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgIHZhciBhbGxFdmVudHMgPSB0aGlzLl9ldmVudHMuYWxsO1xuICAgICAgaWYgKGV2ZW50cykgdHJpZ2dlckV2ZW50cyhldmVudHMsIGFyZ3MpO1xuICAgICAgaWYgKGFsbEV2ZW50cykgdHJpZ2dlckV2ZW50cyhhbGxFdmVudHMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVGVsbCB0aGlzIG9iamVjdCB0byBzdG9wIGxpc3RlbmluZyB0byBlaXRoZXIgc3BlY2lmaWMgZXZlbnRzIC4uLiBvclxuICAgIC8vIHRvIGV2ZXJ5IG9iamVjdCBpdCdzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8uXG4gICAgc3RvcExpc3RlbmluZzogZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICAgIGlmICghbGlzdGVuZXJzKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBkZWxldGVMaXN0ZW5lciA9ICFuYW1lICYmICFjYWxsYmFjaztcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIGlmIChvYmopIChsaXN0ZW5lcnMgPSB7fSlbb2JqLl9saXN0ZW5lcklkXSA9IG9iajtcbiAgICAgIGZvciAodmFyIGlkIGluIGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnNbaWRdLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgIGlmIChkZWxldGVMaXN0ZW5lcikgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tpZF07XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuICAvLyBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBzcGxpdCBldmVudCBzdHJpbmdzLlxuICB2YXIgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcblxuICAvLyBJbXBsZW1lbnQgZmFuY3kgZmVhdHVyZXMgb2YgdGhlIEV2ZW50cyBBUEkgc3VjaCBhcyBtdWx0aXBsZSBldmVudFxuICAvLyBuYW1lcyBgXCJjaGFuZ2UgYmx1clwiYCBhbmQgalF1ZXJ5LXN0eWxlIGV2ZW50IG1hcHMgYHtjaGFuZ2U6IGFjdGlvbn1gXG4gIC8vIGluIHRlcm1zIG9mIHRoZSBleGlzdGluZyBBUEkuXG4gIHZhciBldmVudHNBcGkgPSBmdW5jdGlvbihvYmosIGFjdGlvbiwgbmFtZSwgcmVzdCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtrZXksIG5hbWVba2V5XV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BhY2Ugc2VwYXJhdGVkIGV2ZW50IG5hbWVzLlxuICAgIGlmIChldmVudFNwbGl0dGVyLnRlc3QobmFtZSkpIHtcbiAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoZXZlbnRTcGxpdHRlcik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtuYW1lc1tpXV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBBIGRpZmZpY3VsdC10by1iZWxpZXZlLCBidXQgb3B0aW1pemVkIGludGVybmFsIGRpc3BhdGNoIGZ1bmN0aW9uIGZvclxuICAvLyB0cmlnZ2VyaW5nIGV2ZW50cy4gVHJpZXMgdG8ga2VlcCB0aGUgdXN1YWwgY2FzZXMgc3BlZWR5IChtb3N0IGludGVybmFsXG4gIC8vIEJhY2tib25lIGV2ZW50cyBoYXZlIDMgYXJndW1lbnRzKS5cbiAgdmFyIHRyaWdnZXJFdmVudHMgPSBmdW5jdGlvbihldmVudHMsIGFyZ3MpIHtcbiAgICB2YXIgZXYsIGkgPSAtMSwgbCA9IGV2ZW50cy5sZW5ndGgsIGExID0gYXJnc1swXSwgYTIgPSBhcmdzWzFdLCBhMyA9IGFyZ3NbMl07XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcbiAgICAgIGNhc2UgMTogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTsgcmV0dXJuO1xuICAgICAgY2FzZSAyOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyKTsgcmV0dXJuO1xuICAgICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcbiAgICAgIGRlZmF1bHQ6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBsaXN0ZW5NZXRob2RzID0ge2xpc3RlblRvOiAnb24nLCBsaXN0ZW5Ub09uY2U6ICdvbmNlJ307XG5cbiAgLy8gSW52ZXJzaW9uLW9mLWNvbnRyb2wgdmVyc2lvbnMgb2YgYG9uYCBhbmQgYG9uY2VgLiBUZWxsICp0aGlzKiBvYmplY3QgdG9cbiAgLy8gbGlzdGVuIHRvIGFuIGV2ZW50IGluIGFub3RoZXIgb2JqZWN0IC4uLiBrZWVwaW5nIHRyYWNrIG9mIHdoYXQgaXQnc1xuICAvLyBsaXN0ZW5pbmcgdG8uXG4gIF8uZWFjaChsaXN0ZW5NZXRob2RzLCBmdW5jdGlvbihpbXBsZW1lbnRhdGlvbiwgbWV0aG9kKSB7XG4gICAgRXZlbnRzW21ldGhvZF0gPSBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XG4gICAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IF8udW5pcXVlSWQoJ2wnKSk7XG4gICAgICBsaXN0ZW5lcnNbaWRdID0gb2JqO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgY2FsbGJhY2sgPSB0aGlzO1xuICAgICAgb2JqW2ltcGxlbWVudGF0aW9uXShuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9KTtcblxuICAvLyBBbGlhc2VzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgRXZlbnRzLmJpbmQgICA9IEV2ZW50cy5vbjtcbiAgRXZlbnRzLnVuYmluZCA9IEV2ZW50cy5vZmY7XG5cbiAgLy8gTWl4aW4gdXRpbGl0eVxuICBFdmVudHMubWl4aW4gPSBmdW5jdGlvbihwcm90bykge1xuICAgIHZhciBleHBvcnRzID0gWydvbicsICdvbmNlJywgJ29mZicsICd0cmlnZ2VyJywgJ3N0b3BMaXN0ZW5pbmcnLCAnbGlzdGVuVG8nLFxuICAgICAgICAgICAgICAgICAgICdsaXN0ZW5Ub09uY2UnLCAnYmluZCcsICd1bmJpbmQnXTtcbiAgICBfLmVhY2goZXhwb3J0cywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgcHJvdG9bbmFtZV0gPSB0aGlzW25hbWVdO1xuICAgIH0sIHRoaXMpO1xuICAgIHJldHVybiBwcm90bztcbiAgfTtcblxuICAvLyBFeHBvcnQgRXZlbnRzIGFzIEJhY2tib25lRXZlbnRzIGRlcGVuZGluZyBvbiBjdXJyZW50IGNvbnRleHRcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBFdmVudHM7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBFdmVudHM7XG4gICAgfVxuICAgIGV4cG9ydHMuQmFja2JvbmVFdmVudHMgPSBFdmVudHM7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5CYWNrYm9uZUV2ZW50cyA9IEV2ZW50cztcbiAgfVxufSkodGhpcyk7XG4iLCIhZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSxlKTtlbHNle3ZhciBmO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/Zj13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9mPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKGY9c2VsZiksZi5wYWdlPWUoKX19KGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXG4gIC8qIGpzaGludCBicm93c2VyOnRydWUgKi9cblxuICAvKipcbiAgICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAgICovXG5cbiAgdmFyIHBhdGh0b1JlZ2V4cCA9IF9kZXJlcV8oJ3BhdGgtdG8tcmVnZXhwJyk7XG5cbiAgLyoqXG4gICAqIE1vZHVsZSBleHBvcnRzLlxuICAgKi9cblxuICBtb2R1bGUuZXhwb3J0cyA9IHBhZ2U7XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaC5cbiAgICovXG5cbiAgdmFyIGRpc3BhdGNoID0gdHJ1ZTtcblxuICAvKipcbiAgICogQmFzZSBwYXRoLlxuICAgKi9cblxuICB2YXIgYmFzZSA9ICcnO1xuXG4gIC8qKlxuICAgKiBSdW5uaW5nIGZsYWcuXG4gICAqL1xuXG4gIHZhciBydW5uaW5nO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBgcGF0aGAgd2l0aCBjYWxsYmFjayBgZm4oKWAsXG4gICAqIG9yIHJvdXRlIGBwYXRoYCwgb3IgYHBhZ2Uuc3RhcnQoKWAuXG4gICAqXG4gICAqICAgcGFnZShmbik7XG4gICAqICAgcGFnZSgnKicsIGZuKTtcbiAgICogICBwYWdlKCcvdXNlci86aWQnLCBsb2FkLCB1c2VyKTtcbiAgICogICBwYWdlKCcvdXNlci8nICsgdXNlci5pZCwgeyBzb21lOiAndGhpbmcnIH0pO1xuICAgKiAgIHBhZ2UoJy91c2VyLycgKyB1c2VyLmlkKTtcbiAgICogICBwYWdlKCk7XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBwYXRoXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuLi4uXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHBhZ2UocGF0aCwgZm4pIHtcbiAgICAvLyA8Y2FsbGJhY2s+XG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHJldHVybiBwYWdlKCcqJywgcGF0aCk7XG4gICAgfVxuXG4gICAgLy8gcm91dGUgPHBhdGg+IHRvIDxjYWxsYmFjayAuLi4+XG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGZuKSB7XG4gICAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUocGF0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBwYWdlLmNhbGxiYWNrcy5wdXNoKHJvdXRlLm1pZGRsZXdhcmUoYXJndW1lbnRzW2ldKSk7XG4gICAgICB9XG4gICAgLy8gc2hvdyA8cGF0aD4gd2l0aCBbc3RhdGVdXG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgcGF0aCkge1xuICAgICAgcGFnZS5zaG93KHBhdGgsIGZuKTtcbiAgICAvLyBzdGFydCBbb3B0aW9uc11cbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZS5zdGFydChwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb25zLlxuICAgKi9cblxuICBwYWdlLmNhbGxiYWNrcyA9IFtdO1xuXG4gIC8qKlxuICAgKiBHZXQgb3Igc2V0IGJhc2VwYXRoIHRvIGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5iYXNlID0gZnVuY3Rpb24ocGF0aCl7XG4gICAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJhc2U7XG4gICAgYmFzZSA9IHBhdGg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEJpbmQgd2l0aCB0aGUgZ2l2ZW4gYG9wdGlvbnNgLlxuICAgKlxuICAgKiBPcHRpb25zOlxuICAgKlxuICAgKiAgICAtIGBjbGlja2AgYmluZCB0byBjbGljayBldmVudHMgW3RydWVdXG4gICAqICAgIC0gYHBvcHN0YXRlYCBiaW5kIHRvIHBvcHN0YXRlIFt0cnVlXVxuICAgKiAgICAtIGBkaXNwYXRjaGAgcGVyZm9ybSBpbml0aWFsIGRpc3BhdGNoIFt0cnVlXVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnN0YXJ0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgaWYgKHJ1bm5pbmcpIHJldHVybjtcbiAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICBpZiAoZmFsc2UgPT09IG9wdGlvbnMuZGlzcGF0Y2gpIGRpc3BhdGNoID0gZmFsc2U7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLnBvcHN0YXRlKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvbnBvcHN0YXRlLCBmYWxzZSk7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLmNsaWNrKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgaWYgKCFkaXNwYXRjaCkgcmV0dXJuO1xuICAgIHZhciB1cmwgPSBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCArIGxvY2F0aW9uLmhhc2g7XG4gICAgcGFnZS5yZXBsYWNlKHVybCwgbnVsbCwgdHJ1ZSwgZGlzcGF0Y2gpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVbmJpbmQgY2xpY2sgYW5kIHBvcHN0YXRlIGV2ZW50IGhhbmRsZXJzLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uY2xpY2ssIGZhbHNlKTtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIG9ucG9wc3RhdGUsIGZhbHNlKTtcbiAgfTtcblxuICAvKipcbiAgICogU2hvdyBgcGF0aGAgd2l0aCBvcHRpb25hbCBgc3RhdGVgIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGlzcGF0Y2hcbiAgICogQHJldHVybiB7Q29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zaG93ID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGRpc3BhdGNoKXtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIGlmIChmYWxzZSAhPT0gZGlzcGF0Y2gpIHBhZ2UuZGlzcGF0Y2goY3R4KTtcbiAgICBpZiAoIWN0eC51bmhhbmRsZWQpIGN0eC5wdXNoU3RhdGUoKTtcbiAgICByZXR1cm4gY3R4O1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGBwYXRoYCB3aXRoIG9wdGlvbmFsIGBzdGF0ZWAgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGVcbiAgICogQHJldHVybiB7Q29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5yZXBsYWNlID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGluaXQsIGRpc3BhdGNoKXtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIGN0eC5pbml0ID0gaW5pdDtcbiAgICBpZiAobnVsbCA9PSBkaXNwYXRjaCkgZGlzcGF0Y2ggPSB0cnVlO1xuICAgIGlmIChkaXNwYXRjaCkgcGFnZS5kaXNwYXRjaChjdHgpO1xuICAgIGN0eC5zYXZlKCk7XG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2ggdGhlIGdpdmVuIGBjdHhgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY3R4XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBwYWdlLmRpc3BhdGNoID0gZnVuY3Rpb24oY3R4KXtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgdmFyIGZuID0gcGFnZS5jYWxsYmFja3NbaSsrXTtcbiAgICAgIGlmICghZm4pIHJldHVybiB1bmhhbmRsZWQoY3R4KTtcbiAgICAgIGZuKGN0eCwgbmV4dCk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVbmhhbmRsZWQgYGN0eGAuIFdoZW4gaXQncyBub3QgdGhlIGluaXRpYWxcbiAgICogcG9wc3RhdGUgdGhlbiByZWRpcmVjdC4gSWYgeW91IHdpc2ggdG8gaGFuZGxlXG4gICAqIDQwNHMgb24geW91ciBvd24gdXNlIGBwYWdlKCcqJywgY2FsbGJhY2spYC5cbiAgICpcbiAgICogQHBhcmFtIHtDb250ZXh0fSBjdHhcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHVuaGFuZGxlZChjdHgpIHtcbiAgICB2YXIgY3VycmVudCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gICAgaWYgKGN1cnJlbnQgPT0gY3R4LmNhbm9uaWNhbFBhdGgpIHJldHVybjtcbiAgICBwYWdlLnN0b3AoKTtcbiAgICBjdHgudW5oYW5kbGVkID0gdHJ1ZTtcbiAgICB3aW5kb3cubG9jYXRpb24gPSBjdHguY2Fub25pY2FsUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGEgbmV3IFwicmVxdWVzdFwiIGBDb250ZXh0YFxuICAgKiB3aXRoIHRoZSBnaXZlbiBgcGF0aGAgYW5kIG9wdGlvbmFsIGluaXRpYWwgYHN0YXRlYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIENvbnRleHQocGF0aCwgc3RhdGUpIHtcbiAgICBpZiAoJy8nID09IHBhdGhbMF0gJiYgMCAhPSBwYXRoLmluZGV4T2YoYmFzZSkpIHBhdGggPSBiYXNlICsgcGF0aDtcbiAgICB2YXIgaSA9IHBhdGguaW5kZXhPZignPycpO1xuXG4gICAgdGhpcy5jYW5vbmljYWxQYXRoID0gcGF0aDtcbiAgICB0aGlzLnBhdGggPSBwYXRoLnJlcGxhY2UoYmFzZSwgJycpIHx8ICcvJztcblxuICAgIHRoaXMudGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwge307XG4gICAgdGhpcy5zdGF0ZS5wYXRoID0gcGF0aDtcbiAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gfmkgPyBwYXRoLnNsaWNlKGkgKyAxKSA6ICcnO1xuICAgIHRoaXMucGF0aG5hbWUgPSB+aSA/IHBhdGguc2xpY2UoMCwgaSkgOiBwYXRoO1xuICAgIHRoaXMucGFyYW1zID0gW107XG5cbiAgICAvLyBmcmFnbWVudFxuICAgIHRoaXMuaGFzaCA9ICcnO1xuICAgIGlmICghfnRoaXMucGF0aC5pbmRleE9mKCcjJykpIHJldHVybjtcbiAgICB2YXIgcGFydHMgPSB0aGlzLnBhdGguc3BsaXQoJyMnKTtcbiAgICB0aGlzLnBhdGggPSBwYXJ0c1swXTtcbiAgICB0aGlzLmhhc2ggPSBwYXJ0c1sxXSB8fCAnJztcbiAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gdGhpcy5xdWVyeXN0cmluZy5zcGxpdCgnIycpWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBgQ29udGV4dGAuXG4gICAqL1xuXG4gIHBhZ2UuQ29udGV4dCA9IENvbnRleHQ7XG5cbiAgLyoqXG4gICAqIFB1c2ggc3RhdGUuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBDb250ZXh0LnByb3RvdHlwZS5wdXNoU3RhdGUgPSBmdW5jdGlvbigpe1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKHRoaXMuc3RhdGUsIHRoaXMudGl0bGUsIHRoaXMuY2Fub25pY2FsUGF0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNhdmUgdGhlIGNvbnRleHQgc3RhdGUuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIENvbnRleHQucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpe1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHRoaXMuc3RhdGUsIHRoaXMudGl0bGUsIHRoaXMuY2Fub25pY2FsUGF0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYFJvdXRlYCB3aXRoIHRoZSBnaXZlbiBIVFRQIGBwYXRoYCxcbiAgICogYW5kIGFuIGFycmF5IG9mIGBjYWxsYmFja3NgIGFuZCBgb3B0aW9uc2AuXG4gICAqXG4gICAqIE9wdGlvbnM6XG4gICAqXG4gICAqICAgLSBgc2Vuc2l0aXZlYCAgICBlbmFibGUgY2FzZS1zZW5zaXRpdmUgcm91dGVzXG4gICAqICAgLSBgc3RyaWN0YCAgICAgICBlbmFibGUgc3RyaWN0IG1hdGNoaW5nIGZvciB0cmFpbGluZyBzbGFzaGVzXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gUm91dGUocGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMucGF0aCA9IChwYXRoID09PSAnKicpID8gJyguKiknIDogcGF0aDtcbiAgICB0aGlzLm1ldGhvZCA9ICdHRVQnO1xuICAgIHRoaXMucmVnZXhwID0gcGF0aHRvUmVnZXhwKHRoaXMucGF0aFxuICAgICAgLCB0aGlzLmtleXMgPSBbXVxuICAgICAgLCBvcHRpb25zLnNlbnNpdGl2ZVxuICAgICAgLCBvcHRpb25zLnN0cmljdCk7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIGBSb3V0ZWAuXG4gICAqL1xuXG4gIHBhZ2UuUm91dGUgPSBSb3V0ZTtcblxuICAvKipcbiAgICogUmV0dXJuIHJvdXRlIG1pZGRsZXdhcmUgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gY2FsbGJhY2sgYGZuKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgUm91dGUucHJvdG90eXBlLm1pZGRsZXdhcmUgPSBmdW5jdGlvbihmbil7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihjdHgsIG5leHQpe1xuICAgICAgaWYgKHNlbGYubWF0Y2goY3R4LnBhdGgsIGN0eC5wYXJhbXMpKSByZXR1cm4gZm4oY3R4LCBuZXh0KTtcbiAgICAgIG5leHQoKTtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGlzIHJvdXRlIG1hdGNoZXMgYHBhdGhgLCBpZiBzb1xuICAgKiBwb3B1bGF0ZSBgcGFyYW1zYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtBcnJheX0gcGFyYW1zXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBSb3V0ZS5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihwYXRoLCBwYXJhbXMpe1xuICAgIHZhciBrZXlzID0gdGhpcy5rZXlzXG4gICAgICAsIHFzSW5kZXggPSBwYXRoLmluZGV4T2YoJz8nKVxuICAgICAgLCBwYXRobmFtZSA9IH5xc0luZGV4ID8gcGF0aC5zbGljZSgwLCBxc0luZGV4KSA6IHBhdGhcbiAgICAgICwgbSA9IHRoaXMucmVnZXhwLmV4ZWMoZGVjb2RlVVJJQ29tcG9uZW50KHBhdGhuYW1lKSk7XG5cbiAgICBpZiAoIW0pIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAxLCBsZW4gPSBtLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpIC0gMV07XG5cbiAgICAgIHZhciB2YWwgPSAnc3RyaW5nJyA9PSB0eXBlb2YgbVtpXVxuICAgICAgICA/IGRlY29kZVVSSUNvbXBvbmVudChtW2ldKVxuICAgICAgICA6IG1baV07XG5cbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgcGFyYW1zW2tleS5uYW1lXSA9IHVuZGVmaW5lZCAhPT0gcGFyYW1zW2tleS5uYW1lXVxuICAgICAgICAgID8gcGFyYW1zW2tleS5uYW1lXVxuICAgICAgICAgIDogdmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyYW1zLnB1c2godmFsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlIFwicG9wdWxhdGVcIiBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9ucG9wc3RhdGUoZSkge1xuICAgIGlmIChlLnN0YXRlKSB7XG4gICAgICB2YXIgcGF0aCA9IGUuc3RhdGUucGF0aDtcbiAgICAgIHBhZ2UucmVwbGFjZShwYXRoLCBlLnN0YXRlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIFwiY2xpY2tcIiBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uY2xpY2soZSkge1xuICAgIGlmICgxICE9IHdoaWNoKGUpKSByZXR1cm47XG4gICAgaWYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgIGlmIChlLmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcblxuICAgIC8vIGVuc3VyZSBsaW5rXG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgd2hpbGUgKGVsICYmICdBJyAhPSBlbC5ub2RlTmFtZSkgZWwgPSBlbC5wYXJlbnROb2RlO1xuICAgIGlmICghZWwgfHwgJ0EnICE9IGVsLm5vZGVOYW1lKSByZXR1cm47XG5cbiAgICAvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcbiAgICB2YXIgbGluayA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgIGlmIChlbC5wYXRobmFtZSA9PSBsb2NhdGlvbi5wYXRobmFtZSAmJiAoZWwuaGFzaCB8fCAnIycgPT0gbGluaykpIHJldHVybjtcblxuICAgIC8vIENoZWNrIGZvciBtYWlsdG86IGluIHRoZSBocmVmXG4gICAgaWYgKGxpbmsuaW5kZXhPZihcIm1haWx0bzpcIikgPiAtMSkgcmV0dXJuO1xuXG4gICAgLy8gY2hlY2sgdGFyZ2V0XG4gICAgaWYgKGVsLnRhcmdldCkgcmV0dXJuO1xuXG4gICAgLy8geC1vcmlnaW5cbiAgICBpZiAoIXNhbWVPcmlnaW4oZWwuaHJlZikpIHJldHVybjtcblxuICAgIC8vIHJlYnVpbGQgcGF0aFxuICAgIHZhciBwYXRoID0gZWwucGF0aG5hbWUgKyBlbC5zZWFyY2ggKyAoZWwuaGFzaCB8fCAnJyk7XG5cbiAgICAvLyBzYW1lIHBhZ2VcbiAgICB2YXIgb3JpZyA9IHBhdGggKyBlbC5oYXNoO1xuXG4gICAgcGF0aCA9IHBhdGgucmVwbGFjZShiYXNlLCAnJyk7XG4gICAgaWYgKGJhc2UgJiYgb3JpZyA9PSBwYXRoKSByZXR1cm47XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcGFnZS5zaG93KG9yaWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGJ1dHRvbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gd2hpY2goZSkge1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICByZXR1cm4gbnVsbCA9PSBlLndoaWNoXG4gICAgICA/IGUuYnV0dG9uXG4gICAgICA6IGUud2hpY2g7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGhyZWZgIGlzIHRoZSBzYW1lIG9yaWdpbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2FtZU9yaWdpbihocmVmKSB7XG4gICAgdmFyIG9yaWdpbiA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3RuYW1lO1xuICAgIGlmIChsb2NhdGlvbi5wb3J0KSBvcmlnaW4gKz0gJzonICsgbG9jYXRpb24ucG9ydDtcbiAgICByZXR1cm4gMCA9PSBocmVmLmluZGV4T2Yob3JpZ2luKTtcbiAgfVxuXG59LHtcInBhdGgtdG8tcmVnZXhwXCI6Mn1dLDI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4gKiBFeHBvc2UgYHBhdGh0b1JlZ2V4cGAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gcGF0aHRvUmVnZXhwO1xuXG52YXIgUEFUSF9SRUdFWFAgPSBuZXcgUmVnRXhwKFtcbiAgLy8gTWF0Y2ggYWxyZWFkeSBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgaW5jb3JyZWN0bHkgYXBwZWFyXG4gIC8vIGluIGZ1dHVyZSBtYXRjaGVzLiBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXRcbiAgLy8gc2hvdWxkbid0IGJlIHRyYW5zZm9ybWVkLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiXVxuICAvLyBcIi9yb3V0ZShcXFxcZCspXCIgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWRdXG4gICcoW1xcXFwvLl0pPyg/OlxcXFw6KFxcXFx3KykoPzpcXFxcKCgoPzpcXFxcXFxcXC58W14pXSkqKVxcXFwpKT98XFxcXCgoKD86XFxcXFxcXFwufFteKV0pKilcXFxcKSkoWysqP10pPycsXG4gIC8vIE1hdGNoIHJlZ2V4cCBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYWx3YXlzIGJlIGVzY2FwZWQuXG4gICcoWy4rKj89XiE6JHt9KClbXFxcXF18XFxcXC9dKSdcbl0uam9pbignfCcpLCAnZycpO1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgY2FwdHVyaW5nIGdyb3VwIGJ5IGVzY2FwaW5nIHNwZWNpYWwgY2hhcmFjdGVycyBhbmQgbWVhbmluZy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGdyb3VwXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZUdyb3VwIChncm91cCkge1xuICByZXR1cm4gZ3JvdXAucmVwbGFjZSgvKFs9ITokXFwvKCldKS9nLCAnXFxcXCQxJyk7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiBwYXRoIHN0cmluZywgcmV0dXJuaW5nIGEgcmVndWxhciBleHByZXNzaW9uLlxuICpcbiAqIEFuIGVtcHR5IGFycmF5IHNob3VsZCBiZSBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgY29udGFpbiB0aGUgcGxhY2Vob2xkZXIga2V5XG4gKiBuYW1lcy4gRm9yIGV4YW1wbGUgYC91c2VyLzppZGAgd2lsbCB0aGVuIGNvbnRhaW4gYFtcImlkXCJdYC5cbiAqXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cHxBcnJheSl9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICAgICAgICAgICAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSAgICAgICAgICAgICAgICBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHBhdGh0b1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICBrZXlzID0ga2V5cyB8fCBbXTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0O1xuICB2YXIgZW5kID0gb3B0aW9ucy5lbmQgIT09IGZhbHNlO1xuICB2YXIgZmxhZ3MgPSBvcHRpb25zLnNlbnNpdGl2ZSA/ICcnIDogJ2knO1xuICB2YXIgaW5kZXggPSAwO1xuXG4gIGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgLy8gTWF0Y2ggYWxsIGNhcHR1cmluZyBncm91cHMgb2YgYSByZWdleHAuXG4gICAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpIHx8IFtdO1xuXG4gICAgLy8gTWFwIGFsbCB0aGUgbWF0Y2hlcyB0byB0aGVpciBudW1lcmljIGtleXMgYW5kIHB1c2ggaW50byB0aGUga2V5cy5cbiAgICBrZXlzLnB1c2guYXBwbHkoa2V5cywgZ3JvdXBzLm1hcChmdW5jdGlvbiAobWF0Y2gsIGluZGV4KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAgICAgIGluZGV4LFxuICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgIG9wdGlvbmFsOiAgZmFsc2UsXG4gICAgICAgIHJlcGVhdDogICAgZmFsc2VcbiAgICAgIH07XG4gICAgfSkpO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBzb3VyY2UgYmFjayB0byB0aGUgdXNlci5cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHBhdGgpKSB7XG4gICAgLy8gTWFwIGFycmF5IHBhcnRzIGludG8gcmVnZXhwcyBhbmQgcmV0dXJuIHRoZWlyIHNvdXJjZS4gV2UgYWxzbyBwYXNzXG4gICAgLy8gdGhlIHNhbWUga2V5cyBhbmQgb3B0aW9ucyBpbnN0YW5jZSBpbnRvIGV2ZXJ5IGdlbmVyYXRpb24gdG8gZ2V0XG4gICAgLy8gY29uc2lzdGVudCBtYXRjaGluZyBncm91cHMgYmVmb3JlIHdlIGpvaW4gdGhlIHNvdXJjZXMgdG9nZXRoZXIuXG4gICAgcGF0aCA9IHBhdGgubWFwKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHBhdGh0b1JlZ2V4cCh2YWx1ZSwga2V5cywgb3B0aW9ucykuc291cmNlO1xuICAgIH0pO1xuXG4gICAgLy8gR2VuZXJhdGUgYSBuZXcgcmVnZXhwIGluc3RhbmNlIGJ5IGpvaW5pbmcgYWxsIHRoZSBwYXJ0cyB0b2dldGhlci5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnKD86JyArIHBhdGguam9pbignfCcpICsgJyknLCBmbGFncyk7XG4gIH1cblxuICAvLyBBbHRlciB0aGUgcGF0aCBzdHJpbmcgaW50byBhIHVzYWJsZSByZWdleHAuXG4gIHBhdGggPSBwYXRoLnJlcGxhY2UoUEFUSF9SRUdFWFAsIGZ1bmN0aW9uIChtYXRjaCwgZXNjYXBlZCwgcHJlZml4LCBrZXksIGNhcHR1cmUsIGdyb3VwLCBzdWZmaXgsIGVzY2FwZSkge1xuICAgIC8vIEF2b2lkaW5nIHJlLWVzY2FwaW5nIGVzY2FwZWQgY2hhcmFjdGVycy5cbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgcmV0dXJuIGVzY2FwZWQ7XG4gICAgfVxuXG4gICAgLy8gRXNjYXBlIHJlZ2V4cCBzcGVjaWFsIGNoYXJhY3RlcnMuXG4gICAgaWYgKGVzY2FwZSkge1xuICAgICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZTtcbiAgICB9XG5cbiAgICB2YXIgcmVwZWF0ICAgPSBzdWZmaXggPT09ICcrJyB8fCBzdWZmaXggPT09ICcqJztcbiAgICB2YXIgb3B0aW9uYWwgPSBzdWZmaXggPT09ICc/JyB8fCBzdWZmaXggPT09ICcqJztcblxuICAgIGtleXMucHVzaCh7XG4gICAgICBuYW1lOiAgICAgIGtleSB8fCBpbmRleCsrLFxuICAgICAgZGVsaW1pdGVyOiBwcmVmaXggfHwgJy8nLFxuICAgICAgb3B0aW9uYWw6ICBvcHRpb25hbCxcbiAgICAgIHJlcGVhdDogICAgcmVwZWF0XG4gICAgfSk7XG5cbiAgICAvLyBFc2NhcGUgdGhlIHByZWZpeCBjaGFyYWN0ZXIuXG4gICAgcHJlZml4ID0gcHJlZml4ID8gJ1xcXFwnICsgcHJlZml4IDogJyc7XG5cbiAgICAvLyBNYXRjaCB1c2luZyB0aGUgY3VzdG9tIGNhcHR1cmluZyBncm91cCwgb3IgZmFsbGJhY2sgdG8gY2FwdHVyaW5nXG4gICAgLy8gZXZlcnl0aGluZyB1cCB0byB0aGUgbmV4dCBzbGFzaCAob3IgbmV4dCBwZXJpb2QgaWYgdGhlIHBhcmFtIHdhc1xuICAgIC8vIHByZWZpeGVkIHdpdGggYSBwZXJpb2QpLlxuICAgIGNhcHR1cmUgPSBlc2NhcGVHcm91cChjYXB0dXJlIHx8IGdyb3VwIHx8ICdbXicgKyAocHJlZml4IHx8ICdcXFxcLycpICsgJ10rPycpO1xuXG4gICAgLy8gQWxsb3cgcGFyYW1ldGVycyB0byBiZSByZXBlYXRlZCBtb3JlIHRoYW4gb25jZS5cbiAgICBpZiAocmVwZWF0KSB7XG4gICAgICBjYXB0dXJlID0gY2FwdHVyZSArICcoPzonICsgcHJlZml4ICsgY2FwdHVyZSArICcpKic7XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgYSBwYXJhbWV0ZXIgdG8gYmUgb3B0aW9uYWwuXG4gICAgaWYgKG9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gJyg/OicgKyBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJykpPyc7XG4gICAgfVxuXG4gICAgLy8gQmFzaWMgcGFyYW1ldGVyIHN1cHBvcnQuXG4gICAgcmV0dXJuIHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSc7XG4gIH0pO1xuXG4gIC8vIENoZWNrIHdoZXRoZXIgdGhlIHBhdGggZW5kcyBpbiBhIHNsYXNoIGFzIGl0IGFsdGVycyBzb21lIG1hdGNoIGJlaGF2aW91ci5cbiAgdmFyIGVuZHNXaXRoU2xhc2ggPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV0gPT09ICcvJztcblxuICAvLyBJbiBub24tc3RyaWN0IG1vZGUgd2UgYWxsb3cgYW4gb3B0aW9uYWwgdHJhaWxpbmcgc2xhc2ggaW4gdGhlIG1hdGNoLiBJZlxuICAvLyB0aGUgcGF0aCB0byBtYXRjaCBhbHJlYWR5IGVuZGVkIHdpdGggYSBzbGFzaCwgd2UgbmVlZCB0byByZW1vdmUgaXQgZm9yXG4gIC8vIGNvbnNpc3RlbmN5LiBUaGUgc2xhc2ggaXMgb25seSB2YWxpZCBhdCB0aGUgdmVyeSBlbmQgb2YgYSBwYXRoIG1hdGNoLCBub3RcbiAgLy8gYW55d2hlcmUgaW4gdGhlIG1pZGRsZS4gVGhpcyBpcyBpbXBvcnRhbnQgZm9yIG5vbi1lbmRpbmcgbW9kZSwgb3RoZXJ3aXNlXG4gIC8vIFwiL3Rlc3QvXCIgd2lsbCBtYXRjaCBcIi90ZXN0Ly9yb3V0ZVwiLlxuICBpZiAoIXN0cmljdCkge1xuICAgIHBhdGggPSAoZW5kc1dpdGhTbGFzaCA/IHBhdGguc2xpY2UoMCwgLTIpIDogcGF0aCkgKyAnKD86XFxcXC8oPz0kKSk/JztcbiAgfVxuXG4gIC8vIEluIG5vbi1lbmRpbmcgbW9kZSwgd2UgbmVlZCBwcm9tcHQgdGhlIGNhcHR1cmluZyBncm91cHMgdG8gbWF0Y2ggYXMgbXVjaFxuICAvLyBhcyBwb3NzaWJsZSBieSB1c2luZyBhIHBvc2l0aXZlIGxvb2thaGVhZCBmb3IgdGhlIGVuZCBvciBuZXh0IHBhdGggc2VnbWVudC5cbiAgaWYgKCFlbmQpIHtcbiAgICBwYXRoICs9IHN0cmljdCAmJiBlbmRzV2l0aFNsYXNoID8gJycgOiAnKD89XFxcXC98JCknO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgcGF0aCArIChlbmQgPyAnJCcgOiAnJyksIGZsYWdzKTtcbn07XG5cbn0se31dfSx7fSxbMV0pXG4oMSlcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYmFua1wiOiBcIkJOS1wiLFxuICBcImJhcmtpbmdzaWRlXCI6IFwiQkRFXCIsXG4gIFwiYmV0aG5hbC1ncmVlblwiOiBcIkJOR1wiLFxuICBcImJvbmQtc3RyZWV0XCI6IFwiQkRTXCIsXG4gIFwiYnVja2h1cnN0LWhpbGxcIjogXCJCSExcIixcbiAgXCJjaGFuY2VyeS1sYW5lXCI6IFwiQ1lMXCIsXG4gIFwiY2hpZ3dlbGxcIjogXCJDSEdcIixcbiAgXCJkZWJkZW5cIjogXCJERUJcIixcbiAgXCJlYWxpbmctYnJvYWR3YXlcIjogXCJFQllcIixcbiAgXCJlYXN0LWFjdG9uXCI6IFwiRUFDXCIsXG4gIFwiZXBwaW5nXCI6IFwiRVBQXCIsXG4gIFwiZmFpcmxvcFwiOiBcIkZMUFwiLFxuICBcImdhbnRzLWhpbGxcIjogXCJHSExcIixcbiAgXCJncmFuZ2UtaGlsbFwiOiBcIkdSSFwiLFxuICBcImdyZWVuZm9yZFwiOiBcIkdGRFwiLFxuICBcImhhaW5hdWx0XCI6IFwiSEFJXCIsXG4gIFwiaGFuZ2VyLWxhbmVcIjogXCJITE5cIixcbiAgXCJob2xib3JuXCI6IFwiSE9MXCIsXG4gIFwiaG9sbGFuZC1wYXJrXCI6IFwiSFBLXCIsXG4gIFwibGFuY2FzdGVyLWdhdGVcIjogXCJMQU5cIixcbiAgXCJsZXl0b25cIjogXCJMRVlcIixcbiAgXCJsZXl0b25zdG9uZVwiOiBcIkxZU1wiLFxuICBcImxpdmVycG9vbC1zdHJlZXRcIjogXCJMU1RcIixcbiAgXCJsb3VnaHRvblwiOiBcIkxUTlwiLFxuICBcIm1hcmJsZS1hcmNoXCI6IFwiTUFSXCIsXG4gIFwibWlsZS1lbmRcIjogXCJNTEVcIixcbiAgXCJuZXdidXJ5LXBhcmtcIjogXCJORVBcIixcbiAgXCJub3J0aC1hY3RvblwiOiBcIk5BQ1wiLFxuICBcIm5vcnRob2x0XCI6IFwiTkhUXCIsXG4gIFwibm90dGluZy1oaWxsLWdhdGVcIjogXCJOSEdcIixcbiAgXCJveGZvcmQtY2lyY3VzXCI6IFwiT1hDXCIsXG4gIFwicGVyaXZhbGVcIjogXCJQRVJcIixcbiAgXCJxdWVlbnN3YXlcIjogXCJRV1lcIixcbiAgXCJyZWRicmlkZ2VcIjogXCJSRURcIixcbiAgXCJyb2RpbmctdmFsbGV5XCI6IFwiUk9EXCIsXG4gIFwicnVpc2xpcC1nYXJkZW5zXCI6IFwiUlVHXCIsXG4gIFwic2hlcGhlcmRzLWJ1c2hcIjogXCJTQkNcIixcbiAgXCJzbmFyZXNicm9va1wiOiBcIlNOQlwiLFxuICBcInNvdXRoLXJ1aXNsaXBcIjogXCJTUlBcIixcbiAgXCJzb3V0aC13b29kZm9yZFwiOiBcIlNXRlwiLFxuICBcInN0LXBhdWxzXCI6IFwiU1RQXCIsXG4gIFwic3RyYXRmb3JkXCI6IFwiU0ZEXCIsXG4gIFwidGhleWRvbi1ib2lzXCI6IFwiVEhCXCIsXG4gIFwidG90dGVuaGFtLWNvdXJ0LXJvYWRcIjogXCJUQ1JcIixcbiAgXCJ3YW5zdGVhZFwiOiBcIldBTlwiLFxuICBcIndlc3QtYWN0b25cIjogXCJXQUNcIixcbiAgXCJ3ZXN0LXJ1aXNsaXBcIjogXCJXUlBcIixcbiAgXCJ3aGl0ZS1jaXR5XCI6IFwiV0NUXCIsXG4gIFwid29vZGZvcmRcIjogXCJXRkRcIlxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAnc3RhdGlvbicgOiBmb2N1c1xufTtcblxuZnVuY3Rpb24gZm9jdXMoc3RhdGlvbiwgJGVsKSB7XG4gICAgJGVsLmF0dHIoJ2RhdGEtc3RhdGlvbicsIHN0YXRpb24uY29kZSk7XG4gICAgJGVsLmZpbmQoJ2xpLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wIDogMH0sIDUwMCk7XG4gICAgJCgnbGkuJyArIHN0YXRpb24uY29kZSApLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCd1bC5saW5lIGxpICBhLnBvaW50JykucmVtb3ZlQ2xhc3MoJ3BvaW50Jyk7XG4gICAgICAgICQoJ3VsLmxpbmUgbGkuJyArIHN0YXRpb24uY29kZSArICcgYScpLmFkZENsYXNzKCdwb2ludCcpO1xuICAgIH0sIDEyNTApO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGhpZGVMb2FkZXIoJGVsKSB7XG4gICAgY29uc29sZS5sb2coJ2hpZGUgbG9hZGVyJyk7XG4gICAgJGVsLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG59XG5cbmZ1bmN0aW9uIHNob3dMb2FkZXIoJGVsKSB7XG4gICAgY29uc29sZS5sb2coJ3Nob3cgbG9hZGVyJyk7XG4gICAgJGVsLmFkZENsYXNzKCdsb2FkaW5nJyk7XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZSgkZWwpIHtcbiAgICAkZWwuaGVpZ2h0KCRlbC5maW5kKCcuY29udGFpbmVyJykuaGVpZ2h0KCkpO1xuICAgIC8vJCgnI2Zsb2F0ZXInKS53aWR0aCgkKCcuY29udGFpbmVyJykud2lkdGgoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgICdsb2FkZXI6c2hvdyc6IHNob3dMb2FkZXIsXG4gICAgJ2xvYWRlcjpoaWRlJzogaGlkZUxvYWRlcixcbiAgICAncmVzaXplJzogcmVzaXplXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBjb21wb25lbnQgZnVuY3Rpb25hbGl0eSBpbmNsdWRlcy5cbnZhciBkaXJlY3Rpb24gPSByZXF1aXJlKCcuLi9kaXJlY3Rpb24vZGlyZWN0aW9uJyk7XG5cbi8vIHRlbXBsYXRlIGluY2x1ZGVzXG52YXIgdGVtcGxhdGVFcnJvciA9IHJlcXVpcmUoJy4uL3N0YXRpb24vZXJyb3IuamFkZScpO1xudmFyIHRlbXBsYXRlVHJhaW5zID0gcmVxdWlyZSgnLi4vc3RhdGlvbi90cmFpbnMuamFkZScpO1xuXG5cbi8vdmFyIHN0YXRpb25Db2RlcyA9IHJlcXVpcmUoJy4uLy4uL2ZldGNoZXJzLycpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgICdpbml0JzogaW5pdCxcbiAgICAnc3RhdGlvbic6IGdldFN0YXRpb25EYXRhLFxuICAgICduZXh0VHJhaW46Z290U3RhdGlvbkRhdGEnOiByZW5kZXJcbn07XG5cbmZ1bmN0aW9uIGluaXQoJGVsLCBidXMpIHtcbiAgICB2YXIgJHNlbGVjdCA9ICRlbC5maW5kKCdzZWxlY3QnKTtcbiAgICB2YXIgbmV3U3RhdGlvbiA9ICRzZWxlY3QuZGF0YSgnY3VycmVudGx5TGlzdGVuaW5nJyk7XG4gICAgZXhwb3J0cy5hY3RpdmUgPSBuZXdTdGF0aW9uO1xuICAgIGRpcmVjdGlvbkluaXQoJGVsLCBidXMpO1xufVxuXG5mdW5jdGlvbiBkaXJlY3Rpb25Jbml0KCRlbCwgYnVzKSB7XG4gICAgJGVsLmZpbmQoJ1tkYXRhLWRpcmVjdGlvbl0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXJlY3Rpb24uaW5pdCh0aGlzLmRhdGFzZXQuZGlyZWN0aW9uLCAkKHRoaXMpLCBidXMpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoZGF0YSwgJGVsLCBidXMpIHtcbiAgICByZXR1cm47XG4gICAgdmFyICRzZWxlY3QgPSAkZWwuZmluZCgnc2VsZWN0Jyk7XG4gICAgJHNlbGVjdC5hdHRyKCdkYXRhLWN1cnJlbnRseS1saXN0ZW5pbmcnLCBkYXRhLmNvZGUpO1xuICAgICRzZWxlY3QudmFsKGRhdGEuY29kZSk7XG4gICAgJGVsLmZpbmQoJy5lcnJvcicpLmVtcHR5KCk7XG4gICAgJGVsLmZpbmQoJy50cmFpbnMnKS5odG1sKCQodGVtcGxhdGVUcmFpbnMoe1xuICAgICAgICBzdGF0aW9uOiBkYXRhXG4gICAgfSkpKTtcbiAgICBkaXJlY3Rpb25Jbml0KCRlbCwgYnVzKTtcbiAgICBidXMudHJpZ2dlcigncmVzaXplJyk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXRpb25EYXRhKHN0YXRpb24sICRlbCwgYnVzKSB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiAnL2NlbnRyYWwvJyArIHN0YXRpb24uc2x1ZyArICc/YWpheD10cnVlJyAsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbih4aHIsIHN0YXR1cykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvbXBsZXRlJywgc3RhdHVzKVxuICAgICAgICAgICAgaWYoc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjayhzdGF0aW9uLnNsdWcsICRlbCwgYnVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgYnVzLnRyaWdnZXIoJ25leHRUcmFpbjpnb3RTdGF0aW9uRGF0YScsIGRhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGVycm9yQ2FsbGJhY2soc3RhdGlvbkNvZGUsICRlbCwgYnVzKSB7XG4gICAgY29uc29sZS5sb2coJ0VSUk9SIENBTExCQUNLJyk7XG4gICAgJGVsLmZpbmQoJy50cmFpbnMnKS5lbXB0eSgpO1xuICAgICRlbC5maW5kKCcuZXJyb3InKS5odG1sKHRlbXBsYXRlRXJyb3Ioe3N0YXRpb25Db2RlOiBzdGF0aW9uQ29kZX0pKTtcbiAgICBidXMudHJpZ2dlcigncmVzaXplJyk7XG4gICAgYnVzLnRyaWdnZXIoJ2xvYWRlcjpoaWRlJyk7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gdHJhaW4gbGVmdFxuLy8gbmV3IHRyYWluIGFkZGVkXG4vLyBjb21wbGV0ZSByZWZyZXNoXG5cbnZhciB0cmFpbiA9IHJlcXVpcmUoJy4uL3RyYWluL3RyYWluJyk7XG5cbnZhciB0cmFpblRlbXBsYXRlID0gcmVxdWlyZSgnLi4vdHJhaW4vdHJhaW4uamFkZScpO1xuXG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgJGVsLCBidXMpIHtcbiAgICBidXMub24oJ1dGRC50cmFpbnMuJyArIGRpcmVjdGlvbiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZihkYXRhLmNoYW5nZSA9PT0gXCJpdGVtIHJlbW92ZWQgZnJvbSBsaXN0XCIpIHtcbiAgICAgICAgICAgIC8vIHRvZG8gLSBhbmltYXRlIG91dCBoZXJlXG4gICAgICAgICAgICAkZWwuZmluZCgnbGlbZGF0YS1pZD0nK2RhdGEuaXRlbSArICddJykucmVtb3ZlKCk7XG4gICAgICAgIH0gZWxzZSBpZihkYXRhLm5ld1ZhbHVlKSB7IC8vIG5ldyBpdGVtIGFkZGVkLlxuICAgICAgICAgICAgdmFyIG5ld1RyYWluTWFya3VwID0gdHJhaW5UZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgdHJhaW46IGRhdGEubmV3VmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJGVsLmZpbmQoJ3VsJykuYXBwZW5kKG5ld1RyYWluTWFya3VwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuXG5mdW5jdGlvbiBsaXN0Q2hhbmdlKGRpcmVjdGlvbiwgJGVsLCBidXMsIGRhdGEpIHtcblxufVxuXG5mdW5jdGlvbiByZW1vdmVUcmFpbigpIHtcbiAgICBhbGVydCgncmVtb3ZlIHRyYWluJyk7XG59IiwiLy8gcHJvcGVydHkgdXBkYXRlZFxuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigkZWwsIGJ1cykge1xuICAgIGNvbnNvbGUubG9nKCdpbml0IHRyYWluJyk7XG5cbn07IiwidmFyIGphZGUgPSByZXF1aXJlKCdqYWRlLXJ1bnRpbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKHRyYWluKSB7XG5idWYucHVzaChcIjxsaVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgdHJhaW4uaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHJhaW5cXFwiPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48IS0tYShocmVmPScvY2VudHJhbC1saW5lLycgKyB0cmFpbi5kZXN0aW5hdGlvbi5yZXBsYWNlKC8gL2csICctJykudG9Mb3dlckNhc2UoKSktLT48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48YnIvPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTt9LmNhbGwodGhpcyxcInRyYWluXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50cmFpbjp0eXBlb2YgdHJhaW4hPT1cInVuZGVmaW5lZFwiP3RyYWluOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsIiFmdW5jdGlvbihlKXtpZihcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyltb2R1bGUuZXhwb3J0cz1lKCk7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKGUpO2Vsc2V7dmFyIGY7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz9mPXdpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2Y9Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmJiYoZj1zZWxmKSxmLmphZGU9ZSgpfX0oZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXHJcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXHJcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XHJcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IGFcclxuICogQHBhcmFtIHtPYmplY3R9IGJcclxuICogQHJldHVybiB7T2JqZWN0fSBhXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XHJcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcclxuICAgIHZhciBhdHRycyA9IGFbMF07XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXR0cnM7XHJcbiAgfVxyXG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XHJcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcclxuXHJcbiAgaWYgKGFjIHx8IGJjKSB7XHJcbiAgICBhYyA9IGFjIHx8IFtdO1xyXG4gICAgYmMgPSBiYyB8fCBbXTtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcclxuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBrZXkgaW4gYikge1xyXG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XHJcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBhO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWxcclxuICogQHJldHVybiB7Qm9vbGVhbn1cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gbnVsbHModmFsKSB7XHJcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcclxuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XHJcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpLmZpbHRlcihudWxscykuam9pbignICcpIDogdmFsO1xyXG59XHJcblxyXG4vKipcclxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXHJcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcclxuICB2YXIgYnVmID0gW107XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XHJcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcclxuICAgIH1cclxuICB9XHJcbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xyXG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xyXG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJztcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcclxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcclxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xyXG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xyXG4gICAgaWYgKHZhbCkge1xyXG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XHJcbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xyXG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xyXG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xyXG4gIHZhciBidWYgPSBbXTtcclxuXHJcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xyXG5cclxuICBpZiAoa2V5cy5sZW5ndGgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxyXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XHJcblxyXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcclxuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xyXG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoaHRtbCl7XHJcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKVxyXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XHJcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcclxuICBlbHNlIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vKipcclxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXHJcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XHJcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XHJcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xyXG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XHJcbiAgICB0aHJvdyBlcnI7XHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICBzdHIgPSBzdHIgfHwgX2RlcmVxXygnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcclxuICB9IGNhdGNoIChleCkge1xyXG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcclxuICB9XHJcbiAgdmFyIGNvbnRleHQgPSAzXHJcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxyXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXHJcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XHJcblxyXG4gIC8vIEVycm9yIGNvbnRleHRcclxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcclxuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcclxuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXHJcbiAgICAgICsgY3VyclxyXG4gICAgICArICd8ICdcclxuICAgICAgKyBsaW5lO1xyXG4gIH0pLmpvaW4oJ1xcbicpO1xyXG5cclxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxyXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XHJcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xyXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xyXG4gIHRocm93IGVycjtcclxufTtcclxuXG59LHtcImZzXCI6Mn1dLDI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XX0se30sWzFdKVxuKDEpXG59KTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUtcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoc3RhdGlvbkNvZGUpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwiZXJyb3IgdHJhaW5zXFxcIj48aDI+T29vcHM8L2gyPjxkaXYgY2xhc3M9XFxcImRldGFpbFxcXCI+U29tZXRoaW5nIFdlbnQgd3JvbmcuIHlvdSBjYW4gdHJ5IHJlZnJlc2hpbmcgdGhlIHBhZ2UsIG9yIG1heWJlIHBvcCBiYWNrIGxhdGVyLjxwPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gJ0FuIGVycm9yIG9jY3VyZWQgZmV0Y2hpbmcgJyArIHN0YXRpb25Db2RlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3A+PC9kaXY+PGhyLz48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJzdGF0aW9uQ29kZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc3RhdGlvbkNvZGU6dHlwZW9mIHN0YXRpb25Db2RlIT09XCJ1bmRlZmluZWRcIj9zdGF0aW9uQ29kZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUtcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoc3RhdGlvbikge1xudmFyIG5vVHJhaW5zID0gdHJ1ZTtcbmlmICggc3RhdGlvbilcbntcbi8vIGl0ZXJhdGUgc3RhdGlvbi50cmFpbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc3RhdGlvbi50cmFpbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBkaXJlY3Rpb24gPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGRpcmVjdGlvbiA8ICQkbDsgZGlyZWN0aW9uKyspIHtcbiAgICAgIHZhciB0cmFpbnMgPSAkJG9ialtkaXJlY3Rpb25dO1xuXG5pZiAoIHRyYWlucy5sZW5ndGggPiAwKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJkaXJlY3Rpb25cXFwiPjxoMz5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGRpcmVjdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9oMz48dWxcIiArIChqYWRlLmF0dHIoXCJkYXRhLWRpcmVjdGlvblwiLCBkaXJlY3Rpb24sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHJhaW5zXFxcIj5cIik7XG4vLyBpdGVyYXRlIHRyYWluc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSB0cmFpbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciB0cmFpbiA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpIGNsYXNzPVxcXCJ0cmFpblxcXCI+PGRpdiBjbGFzcz1cXFwiZHVlLWNvbnRhaW5lclxcXCI+PHNwYW4gY2xhc3M9XFxcImR1ZVxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kdWVJbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvZGl2PjwhLS1hKGhyZWY9Jy9jZW50cmFsLWxpbmUvJyArIHRyYWluLmRlc3RpbmF0aW9uLnJlcGxhY2UoLyAvZywgJy0nKS50b0xvd2VyQ2FzZSgpKS0tPjxzcGFuIGNsYXNzPVxcXCJkZXN0aW5hdGlvblxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5kZXN0aW5hdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxici8+PHNwYW4gY2xhc3M9XFxcImRldGFpbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0cmFpbi5sb2NhdGlvbikgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyICRpbmRleCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHRyYWluID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGkgY2xhc3M9XFxcInRyYWluXFxcIj48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PCEtLWEoaHJlZj0nL2NlbnRyYWwtbGluZS8nICsgdHJhaW4uZGVzdGluYXRpb24ucmVwbGFjZSgvIC9nLCAnLScpLnRvTG93ZXJDYXNlKCkpLS0+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGJyLz48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC91bD48L2Rpdj5cIik7XG5ub1RyYWlucyA9IGZhbHNlO1xufVxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGRpcmVjdGlvbiBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIHRyYWlucyA9ICQkb2JqW2RpcmVjdGlvbl07XG5cbmlmICggdHJhaW5zLmxlbmd0aCA+IDApXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImRpcmVjdGlvblxcXCI+PGgzPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZGlyZWN0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2gzPjx1bFwiICsgKGphZGUuYXR0cihcImRhdGEtZGlyZWN0aW9uXCIsIGRpcmVjdGlvbiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0cmFpbnNcXFwiPlwiKTtcbi8vIGl0ZXJhdGUgdHJhaW5zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHRyYWlucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIHRyYWluID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGkgY2xhc3M9XFxcInRyYWluXFxcIj48ZGl2IGNsYXNzPVxcXCJkdWUtY29udGFpbmVyXFxcIj48c3BhbiBjbGFzcz1cXFwiZHVlXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmR1ZUluKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9kaXY+PCEtLWEoaHJlZj0nL2NlbnRyYWwtbGluZS8nICsgdHJhaW4uZGVzdGluYXRpb24ucmVwbGFjZSgvIC9nLCAnLScpLnRvTG93ZXJDYXNlKCkpLS0+PHNwYW4gY2xhc3M9XFxcImRlc3RpbmF0aW9uXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmRlc3RpbmF0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGJyLz48c3BhbiBjbGFzcz1cXFwiZGV0YWlsXFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHRyYWluLmxvY2F0aW9uKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgdHJhaW4gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaSBjbGFzcz1cXFwidHJhaW5cXFwiPjxkaXYgY2xhc3M9XFxcImR1ZS1jb250YWluZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJkdWVcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZHVlSW4pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2Rpdj48IS0tYShocmVmPScvY2VudHJhbC1saW5lLycgKyB0cmFpbi5kZXN0aW5hdGlvbi5yZXBsYWNlKC8gL2csICctJykudG9Mb3dlckNhc2UoKSktLT48c3BhbiBjbGFzcz1cXFwiZGVzdGluYXRpb25cXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4uZGVzdGluYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48YnIvPjxzcGFuIGNsYXNzPVxcXCJkZXRhaWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHJhaW4ubG9jYXRpb24pID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3VsPjwvZGl2PlwiKTtcbm5vVHJhaW5zID0gZmFsc2U7XG59XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmlmICggbm9UcmFpbnMpXG57XG5idWYucHVzaChcIjxoMyBjbGFzcz1cXFwibm9UcmFpbnNcXFwiPk5vIFRyYWluczwvaDM+XCIpO1xufX0uY2FsbCh0aGlzLFwic3RhdGlvblwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc3RhdGlvbjp0eXBlb2Ygc3RhdGlvbiE9PVwidW5kZWZpbmVkXCI/c3RhdGlvbjp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGluaXQoJGVsLCBidXMpIHtcbiAgICAkZWwuY2hhbmdlKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIG5ld1N0YXRpb25TbHVnID0gZS5jdXJyZW50VGFyZ2V0LnNlbGVjdGVkT3B0aW9uc1swXS5sYWJlbC5yZXBsYWNlKC8gL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgYnVzLnRyaWdnZXIoJ3BhZ2U6bG9hZCcsICcvY2VudHJhbC8nICsgbmV3U3RhdGlvblNsdWcpO1xuICAgIH0pO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXRcbn07XG4iXX0=