require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({78:[function(require,module,exports){
'use strict';


var template = require('./about.jade');

NT.pages.about = module.exports = function(context) {
        if(!context.init) {
            NT.$('body').attr('data-page', 'about');
            document.title = 'About';
            NT.$('#content').html(template());
        }
        NT.bus.trigger('zoom:out');
};

NT.pages.about.prototype.destroy = function(callback) {
    callback();
};


},{"./about.jade":77}],77:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"about\"><div id=\"floater\"><div class=\"container\"><h3>About</h3><p>This site was made by <a href=\"http://simonmcmanus.com\">Simon McManus</a>.</p><p>Big thanks to <a href=\"http://www.johngalantini.com/\">John Galantini</a> for making this all possible with <a href=\"http://csstubemap.co.uk\">csstubemap.co.uk</a>.</p><p>The source code is available at <a href=\"http://github.com/simonmcmanus\">http://github.com/simonmcmanus</a></p></div></div></div>");;return buf.join("");
};
},{"jade/runtime":17}]},{},[78]);
