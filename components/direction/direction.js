'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');

var trainTemplate = require('../train/train.jade');

var stationCode = null;
var direction = null;


var direction = module.exports = function(stationCode, direction, $el, bus) {
    this.stationCode = stationCode;
    this.direction = direction;
    this.trains = {};
    this.$el = $el;
    this.bus = bus;
    this.initChildren();
    bus.on(stationCode + '.trains.' + direction, this.listChange.bind(this));
};



direction.prototype.initChildren = function() {
    var self = this;
    self.$el.find('li.train[data-id]').each(function() {
        var trainId = $(this).data('id');
        var newTrain = new train(self.stationCode, self.direction, trainId, $(this), self.bus);
        self.trains[trainId] = newTrain;
    });
};


direction.prototype.destroy = function() {
    var trains = this.trains;
    Object.keys(trains).forEach(function(train) {
//        console.log('calling destroy on train', trains, trains[train]);
        trains[train].destroy();
        //delete trains[train];
    });
};

direction.prototype.addNode = function(data) {
    var $newTrainMarkup = $(trainTemplate({
        train: data.newValue
    })).addClass('added add');
    // todo - check the li exists before beforeig it? but should that be necessary?

    var $putAfter = this.$el.find('li').eq(data.position);

    if(this.$el.find('li').eq(data.position).length < 1) {
        $putAfter = this.$el.find('li:last');
        console.log('got a  laster');
    }

    $putAfter.after($newTrainMarkup) ;

    var newTrain = new train(this.stationCode, this.direction, data.item, $newTrainMarkup, this.bus);
    this.trains[data.item] = newTrain;
    var self = this;
    setTimeout(function() {
        $newTrainMarkup.removeClass('added');
        $newTrainMarkup.bind('transitionend', function() {
            self.bus.trigger('resize');
            $(this).removeClass('add');
        });
    }, 0);
};



direction.prototype.delNode = function(id) {
    var self = this;
    var $el = self.$el.find('li[data-id=' + id + ']');
    /**
     * As css transistions dont work with height
     * auto we set the height explicitly.
     */
    $el.css('height', $el.outerHeight());
    setTimeout(function() {
        $el.addClass('colapsed');
    }, 0);
    // should listen for transition end event.
    setTimeout(function() {
        $el.remove();
        self.bus.trigger('resize');
    }, 2000);
};



direction.prototype.mover = function (data) {
    var up = (data.originalPosition > data.newPosition);
    var $nextNewEl = this.$el.find('.train').eq( data.newPosition );

    var $item  = this.$el.find('.train[data-id="' + data.item + '"]');
    $item.addClass('moving');
    var itemHeight = $item.outerHeight();
    var $holderOld = $('<div class="holder sss">').css({
        height: $item.outerHeight()
    });

    $holderOld.insertAfter($item);

    $item.css({
        position: 'absolute',
        top: $holderOld.position().top - itemHeight,
        left: $holderOld.position().left,
    });

    $holderOld.height(0);

    var $holderNew = $('<div class="holder aaa">');

    if(up) {
        $holderNew.insertBefore($nextNewEl);
    } else {
        $holderNew.insertAfter($nextNewEl);
    }

    $holderNew.css({
        height: $item.outerHeight()
    })
    if($nextNewEl.length < 1) {
     //   alert('not found');
    }

    var newTop;
    if(up) {
        $item.insertBefore($nextNewEl);
        newTop = $holderNew.position().top ;
    }else {
        $item.insertAfter($nextNewEl);
        newTop = $holderNew.position().top - itemHeight;
    }

    $item.css({
        top: newTop,
        left: $holderNew.position().left,
    });

//        debugger
    setTimeout(function() {
        $holderNew.remove();
        $holderOld.remove();
        $item.removeClass('moving');
        $item.css({
            position: 'relative',
            top: 'auto',
            left: 'auto'
        });
    }, 1000);

};

direction.prototype.listChange = function(data) {
    switch(data.code) {
        case 'ITEM_DELETE':
            this.delNode(data.item);
        break;
        case 'ITEM_CREATE':
            this.addNode(data);
        break;
        case 'ITEM_MOVE':
            this.mover(data);
        break;
    }
}