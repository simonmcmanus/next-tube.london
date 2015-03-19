'use strict';


var floater = module.exports = function(bus) {
//    this.setState('hidden');
    bus.on('station',this.station.bind(this));
    bus.on('loader:show',this.showLoader.bind(this));
    bus.on('error:show', this.showError.bind(this));
    bus.on('error:hide', this.hideError.bind(this));
    bus.on('loader:hide', this.hideLoader.bind(this));
    bus.on('increaseHeight', this.increaseHeight.bind(this));
    bus.on('decreaseHeight', this.decreaseHeight.bind(this));
    bus.on('resize', this.resize.bind(this));
    bus.on('zoom:finished', this.zoomEnd.bind(this));
    bus.on('moving', this.hide.bind(this));
    bus.on('zoomto:station', this.loading.bind(this));
    bus.on('loading', this.loading.bind(this));
    bus.on('loaded', this.loaded.bind(this));
};

floater.prototype.loading = function(params, next) {
    if(this.$el) {
        this.$el.addClass('loading');
    }
    next();
};

floater.prototype.loaded = function(params, next) {
    this.$el.removeClass('loading');
    next();
};

floater.prototype.hide = function(params, next) {
    this.setState('small');
    this.$el.one('transitionend', next);
};

floater.prototype.zoomEnd = function(params, next) {
    this.setState('active');
    next();
};


var targetHeight = null;

floater.prototype.getState = function() {
    return this.$el.attr('data-state');
};

floater.prototype.setState = function(newState, callback) {
    this.$el.attr('data-state', newState);
};

floater.prototype.station = function() {
    this.setState('small');
};

floater.prototype.hideLoader = function() {
    this.setState('');
};

floater.prototype.showLoader = function() {
    //this.setState('loading');
};

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


