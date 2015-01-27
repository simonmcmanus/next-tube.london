'use strict';


var floater = module.exports = function($el, bus) {
    this.$el = $el;
    this.setState('hidden');

    bus.on('loader:show',this.showLoader.bind(this));
    bus.on('error:show', this.showError.bind(this));
    bus.on('error:hide', this.hideError.bind(this));
    bus.on('loader:hide', this.hideLoader.bind(this));
    bus.on('increaseHeight', this.increaseHeight.bind(this));
    bus.on('decreaseHeight', this.decreaseHeight.bind(this));
    bus.on('resize', this.resize.bind(this));
    bus.on('zoom:finished', this.inPlace.bind(this));
};

floater.prototype.hideFloater = function() {
    this.setState('hidden');
};

floater.prototype.inPlace = function() {
    this.setState('loading');
}

var targetHeight = null;


floater.prototype.setState = function(newState) {
    this.$el.attr('data-state', newState);
};


floater.prototype.hideLoader = function() {
    var self= this;
    var loadedTime = this.$el.data('loadTime');
    var now = +new Date();

    now - loadedTime;
    var timeSoFar = now - loadedTime;
    var minTime = 1000;

    if(timeSoFar < minTime) {

        var wait = minTime - timeSoFar;
        setTimeout(function() {
            self.$el.removeClass('loading');
        }, wait);
    }else {
        self.$el.removeClass('loading');
    }
}

floater.prototype.showLoader = function() {
    var loaderStartTime = +new Date();
    this.$el.data('loadTime', loaderStartTime);
    this.$el.addClass('loading');
}

floater.prototype.showError = function() {
    this.$el.addClass('error');
    this.resize(this.$el);
    this.hideLoader(this.$el);
}

floater.prototype.hideError = function() {
    this.$el.removeClass('error');
}

floater.prototype.resize = function() {
    this.$el.height(this.$el.find('.container').height());
    //$el.width($el.find('.container').width());
}

floater.prototype.increaseHeight = function(addHeight) {
    console.log('th', targetHeight);
    if(!targetHeight) {
        targetHeight = $el.find('.container').height() + addHeight;
    }else {
        targetHeight = targetHeight + addHeight;
    }
    this.$el.height(targetHeight);
}

floater.prototype.decreaseHeight = function(removeHeight) {
    if(!targetHeight) {
        targetHeight = this.$el.find('.container').height() - removeHeight;
    }else {
        targetHeight = targetHeight - removeHeight;
    }
    this.$el.height(targetHeight);
}


