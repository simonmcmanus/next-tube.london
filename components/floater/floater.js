'use strict';


var floater = module.exports = function($el, bus) {
    this.$el = $el;
//    this.setState('hidden');

    bus.on('loader:show',this.showLoader.bind(this));
    bus.on('error:show', this.showError.bind(this));
    bus.on('error:hide', this.hideError.bind(this));
    bus.on('loader:hide', this.hideLoader.bind(this));
    bus.on('increaseHeight', this.increaseHeight.bind(this));
    bus.on('decreaseHeight', this.decreaseHeight.bind(this));
    bus.on('resize', this.resize.bind(this));
    bus.on('zoom:finished', this.zoomEnd.bind(this));
    bus.on('zoom:start', this.zoomStart.bind(this));
    bus.on('data:inplace', this.dataInPlace.bind(this));
};


floater.prototype.zoomStart = function() {
    this.$el.addClass('hidden')
}

floater.prototype.zoomEnd = function() {
    this.$el.removeClass('hidden');
}


floater.prototype.dataInPlace = function() {
    this.setState('');
}




var targetHeight = null;


floater.prototype.getState = function() {
    return this.$el.attr('data-state');
};

floater.prototype.setState = function(newState) {
    console.log('set state', newState);
    this.$el.attr('data-state', newState);
};


floater.prototype.hideLoader = function() {
    this.setState('');
}

floater.prototype.showLoader = function() {
    this.setState('loading');
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


