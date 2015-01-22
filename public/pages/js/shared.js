(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    bus.on(stationCode + '.platforms.' + direction + '.trains', this.listChange.bind(this));
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
},{"../train/train":9,"../train/train.jade":8}],2:[function(require,module,exports){
'use strict';


var floater = module.exports = function($el, bus) {
    this.$el = $el;
    bus.on('loader:show',this.showLoader.bind(this));
    bus.on('error:show', this.showError.bind(this));
    bus.on('error:hide', this.hideError.bind(this));
    bus.on('loader:hide', this.hideLoader.bind(this));
    bus.on('increaseHeight', this.increaseHeight.bind(this));
    bus.on('decreaseHeight', this.decreaseHeight.bind(this));
    bus.on('resize', this.resize.bind(this));
};


var targetHeight = null;

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



},{}],3:[function(require,module,exports){
module.exports=[
    {
        "id": "OXC",
        "name": "Oxford Circus",
        "lines": [
            "B",
            "C",
            "V"
        ],
        "slug": "bakerloo/oxford-circus"
    },
    {
        "id": "BNK",
        "name": "Bank",
        "lines": [
            "C",
            "N",
            "W"
        ],
        "slug": "central/bank"
    },
    {
        "id": "BDE",
        "name": "Barkingside",
        "lines": [
            "C"
        ],
        "slug": "central/barkingside"
    },
    {
        "id": "BNG",
        "name": "Bethnal Green",
        "lines": [
            "C"
        ],
        "slug": "central/bethnal-green"
    },
    {
        "id": "BDS",
        "name": "Bond Street",
        "lines": [
            "C",
            "J"
        ],
        "slug": "central/bond-street"
    },
    {
        "id": "BHL",
        "name": "Buckhurst Hill",
        "lines": [
            "C"
        ],
        "slug": "central/buckhurst-hill"
    },
    {
        "id": "CYL",
        "name": "Chancery Lane",
        "lines": [
            "C"
        ],
        "slug": "central/chancery-lane"
    },
    {
        "id": "CHG",
        "name": "Chigwell",
        "lines": [
            "C"
        ],
        "slug": "central/chigwell"
    },
    {
        "id": "DEB",
        "name": "Debden",
        "lines": [
            "C"
        ],
        "slug": "central/debden"
    },
    {
        "id": "EBY",
        "name": "Ealing Broadway",
        "lines": [
            "C",
            "D"
        ],
        "slug": "central/ealing-broadway"
    },
    {
        "id": "EAC",
        "name": "East Acton",
        "lines": [
            "C"
        ],
        "slug": "central/east-acton"
    },
    {
        "id": "EPP",
        "name": "Epping",
        "lines": [
            "C"
        ],
        "slug": "central/epping"
    },
    {
        "id": "FLP",
        "name": "Fairlop",
        "lines": [
            "C"
        ],
        "slug": "central/fairlop"
    },
    {
        "id": "GHL",
        "name": "Gants Hill",
        "lines": [
            "C"
        ],
        "slug": "central/gants-hill"
    },
    {
        "id": "GRH",
        "name": "Grange Hill",
        "lines": [
            "C"
        ],
        "slug": "central/grange-hill"
    },
    {
        "id": "GFD",
        "name": "Greenford",
        "lines": [
            "C"
        ],
        "slug": "central/greenford"
    },
    {
        "id": "HAI",
        "name": "Hainault",
        "lines": [
            "C"
        ],
        "slug": "central/hainault"
    },
    {
        "id": "HLN",
        "name": "Hanger Lane",
        "lines": [
            "C"
        ],
        "slug": "central/hanger-lane"
    },
    {
        "id": "HOL",
        "name": "Holborn",
        "lines": [
            "C",
            "P"
        ],
        "slug": "central/holborn"
    },
    {
        "id": "HPK",
        "name": "Holland Park",
        "lines": [
            "C"
        ],
        "slug": "central/holland-park"
    },
    {
        "id": "LAN",
        "name": "Lancaster Gate",
        "lines": [
            "C"
        ],
        "slug": "central/lancaster-gate"
    },
    {
        "id": "LEY",
        "name": "Leyton",
        "lines": [
            "C"
        ],
        "slug": "central/leyton"
    },
    {
        "id": "LYS",
        "name": "Leytonstone",
        "lines": [
            "C"
        ],
        "slug": "central/leytonstone"
    },
    {
        "id": "LST",
        "name": "Liverpool Street",
        "lines": [
            "C",
            "H",
            "M"
        ],
        "slug": "central/liverpool-street"
    },
    {
        "id": "LTN",
        "name": "Loughton",
        "lines": [
            "C"
        ],
        "slug": "central/loughton"
    },
    {
        "id": "MAR",
        "name": "Marble Arch",
        "lines": [
            "C"
        ],
        "slug": "central/marble-arch"
    },
    {
        "id": "MLE",
        "name": "Mile End",
        "lines": [
            "C",
            "D",
            "H"
        ],
        "slug": "central/mile-end"
    },
    {
        "id": "NEP",
        "name": "Newbury Park",
        "lines": [
            "C"
        ],
        "slug": "central/newbury-park"
    },
    {
        "id": "NAC",
        "name": "North Acton",
        "lines": [
            "C"
        ],
        "slug": "central/north-acton"
    },
    {
        "id": "NHT",
        "name": "Northolt",
        "lines": [
            "C"
        ],
        "slug": "central/northolt"
    },
    {
        "id": "NHG",
        "name": "Notting Hill Gate",
        "lines": [
            "C"
        ],
        "slug": "central/notting-hill-gate"
    },
    {
        "id": "PER",
        "name": "Perivale",
        "lines": [
            "C"
        ],
        "slug": "central/perivale"
    },
    {
        "id": "QWY",
        "name": "Queensway",
        "lines": [
            "C"
        ],
        "slug": "central/queensway"
    },
    {
        "id": "RED",
        "name": "Redbridge",
        "lines": [
            "C"
        ],
        "slug": "central/redbridge"
    },
    {
        "id": "ROD",
        "name": "Roding Valley",
        "lines": [
            "C"
        ],
        "slug": "central/roding-valley"
    },
    {
        "id": "RUG",
        "name": "Ruislip Gardens",
        "lines": [
            "C"
        ],
        "slug": "central/ruislip-gardens"
    },
    {
        "id": "SBC",
        "name": "Shepherd's Bush",
        "lines": [
            "C"
        ],
        "slug": "central/shepherd's-bush"
    },
    {
        "id": "SNB",
        "name": "Snaresbrook",
        "lines": [
            "C"
        ],
        "slug": "central/snaresbrook"
    },
    {
        "id": "SRP",
        "name": "South Ruislip",
        "lines": [
            "C"
        ],
        "slug": "central/south-ruislip"
    },
    {
        "id": "SWF",
        "name": "South Woodford",
        "lines": [
            "C"
        ],
        "slug": "central/south-woodford"
    },
    {
        "id": "STP",
        "name": "St Paul's",
        "lines": [
            "C"
        ],
        "slug": "central/st-pauls"
    },
    {
        "id": "SFD",
        "name": "Stratford",
        "lines": [
            "C",
            "J"
        ],
        "slug": "central/stratford"
    },
    {
        "id": "THB",
        "name": "Theydon Bois",
        "lines": [
            "C"
        ],
        "slug": "central/theydon-bois"
    },
    {
        "id": "TCR",
        "name": "Tottenham Court Road",
        "lines": [
            "C",
            "N"
        ],
        "slug": "central/tottenham-court-road"
    },
    {
        "id": "WAN",
        "name": "Wanstead",
        "lines": [
            "C"
        ],
        "slug": "central/wanstead"
    },
    {
        "id": "WAC",
        "name": "West Acton",
        "lines": [
            "C"
        ],
        "slug": "central/west-acton"
    },
    {
        "id": "WRP",
        "name": "West Ruislip",
        "lines": [
            "C"
        ],
        "slug": "central/west-ruislip"
    },
    {
        "id": "WCT",
        "name": "White City",
        "lines": [
            "C"
        ],
        "slug": "central/white-city"
    },
    {
        "id": "WFD",
        "name": "Woodford",
        "lines": [
            "C"
        ],
        "slug": "central/woodford"
    }
]
},{}],4:[function(require,module,exports){
'use strict';

var switcher = module.exports = function($el, bus) {
    var $select = $el.find('input.stationSearch');
    this.$el = $el;
    console.log('$select', this.hide);
    bus.on('search:hide', this.hide.bind(this));
    bus.on('search:show', this.show.bind(this));
    $select.selectize({

        persist: false,
         maxItems: 1,
         valueField: 'id',
         labelField: 'name',
         searchField: ['name', 'id'],
         options: require('./lib/all-stations.json'),

        // openOnFocus: false,
        // dataAttr: 'data-code',
        // allowEmptyOption: true,
        onChange: function(item) {
            console.log('change')
            if(item !== '') {
                var url = this.options[item].slug;
                bus.trigger('search:highlight', [item]);
                bus.trigger('page:load', '/' + url);
            }
        },

        onType: function(search) {
            console.log('type')
//            bus.trigger('page:load', '/search' );
           var possibles = this.currentResults.items.map(function(i) { return i.id } );
           bus.trigger('search:highlight', possibles);
        },
    });
};


switcher.prototype.hide = function() {
    this.$el.addClass('hide');
};

switcher.prototype.show = function() {
    this.$el.removeClass('hide');
};

},{"./lib/all-stations.json":3}],5:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (stationCode) {
buf.push("<h2>Ooops</h2><div class=\"detail\">Something Went wrong. you can try refreshing the page, or maybe pop back later.<p>" + (jade.escape(null == (jade_interp = 'An error occured fetching ' + stationCode) ? "" : jade_interp)) + "</p></div><hr/>");}.call(this,"stationCode" in locals_for_with?locals_for_with.stationCode:typeof stationCode!=="undefined"?stationCode:undefined));;return buf.join("");
};
},{"jade/runtime":13}],6:[function(require,module,exports){
'use strict';

// component functionality includes.
var direction = require('../direction/direction');

// template includes
var templateError = require('../station/error.jade');
var templateTrains = require('../station/trains.jade');


//var stationCodes = require('../../fetchers/')


var station = module.exports = function($el, bus) {
    var $select = $el.find('select');
    this.directions = {};
    this.bus = bus;
    this.$el = $el;
    this.code = $select.data('currentlyListening');
    this.directionInit();
    bus.on('nextTrain:gotStationData', this.render.bind(this));
    bus.on('station', this.changeStation.bind(this));
    var self = this;
    setTimeout(function() {
        self.bus.trigger('loading:hide');
    },1000);
};

station.prototype.changeStation = function(newStation) {

    var directions = this.directions;
    this.code = newStation.code;
    Object.keys(directions).forEach(function(direction) {
        directions[direction].destroy();
    });
    this.getStationData(newStation);
};

station.prototype.directionInit = function() {
    var self = this;
    self.$el.find('[data-direction]').each(function() {
        var dir = new direction(self.code, this.dataset.direction, $(this), self.bus);
        self.directions[this.dataset.direction] = dir;
    });
};

window.onresize = function() {
    bus.trigger('resize');
};

station.prototype.render = function(data) {
    var $el = this.$el;
    var $select = $el.find('select');
    // $select.attr('data-currently-listening', data.code);
    // $select.val(data.code);
//    $el.find('.error').empty();
    var $newMarkup = $(templateTrains({
        station: data
    }));
    var self = this;
    // should listen for floater
    setTimeout(function() {
        $el.find('div.listing').html($newMarkup);
        self.directionInit(data.code, $el, self.bus);
        self.bus.trigger('resize');
    }, 400);
};


},{"../direction/direction":1,"../station/error.jade":5,"../station/trains.jade":7}],7:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (station, console) {
var noTrains = true;
if ( station)
{
console.log('-->', station);
// iterate station.platforms
;(function(){
  var $$obj = station.platforms;
  if ('number' == typeof $$obj.length) {

    for (var platformId = 0, $$l = $$obj.length; platformId < $$l; platformId++) {
      var platform = $$obj[platformId];

if ( platform.trains.length > 0)
{
if ( platform)
{
buf.push("<div" + (jade.attr("data-direction", platformId, true, false)) + " class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = platform.name) ? "" : jade_interp)) + "</h3><ul class=\"trains\">");
// iterate platform.trains
;(function(){
  var $$obj = platform.trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

if ( train)
{
buf.push("<li" + (jade.attr("data-id", train.id, true, false)) + " class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><!--span.destination=train.destination + ' - ' + train.id--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><!--span.platform=train.platform--><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
}
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

if ( train)
{
buf.push("<li" + (jade.attr("data-id", train.id, true, false)) + " class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><!--span.destination=train.destination + ' - ' + train.id--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><!--span.platform=train.platform--><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
}
    }

  }
}).call(this);

buf.push("</ul></div>");
}
noTrains = false;
}
    }

  } else {
    var $$l = 0;
    for (var platformId in $$obj) {
      $$l++;      var platform = $$obj[platformId];

if ( platform.trains.length > 0)
{
if ( platform)
{
buf.push("<div" + (jade.attr("data-direction", platformId, true, false)) + " class=\"direction\"><h3>" + (jade.escape(null == (jade_interp = platform.name) ? "" : jade_interp)) + "</h3><ul class=\"trains\">");
// iterate platform.trains
;(function(){
  var $$obj = platform.trains;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var train = $$obj[$index];

if ( train)
{
buf.push("<li" + (jade.attr("data-id", train.id, true, false)) + " class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><!--span.destination=train.destination + ' - ' + train.id--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><!--span.platform=train.platform--><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
}
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var train = $$obj[$index];

if ( train)
{
buf.push("<li" + (jade.attr("data-id", train.id, true, false)) + " class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><!--span.destination=train.destination + ' - ' + train.id--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><!--span.platform=train.platform--><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
}
    }

  }
}).call(this);

buf.push("</ul></div>");
}
noTrains = false;
}
    }

  }
}).call(this);

}
if ( noTrains)
{
buf.push("<h3 class=\"noTrains\">No Trains</h3>");
}}.call(this,"station" in locals_for_with?locals_for_with.station:typeof station!=="undefined"?station:undefined,"console" in locals_for_with?locals_for_with.console:typeof console!=="undefined"?console:undefined));;return buf.join("");
};
},{"jade/runtime":13}],8:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (train) {
if ( train)
{
buf.push("<li" + (jade.attr("data-id", train.id, true, false)) + " class=\"train\"><div class=\"due-container\"><span class=\"due\">" + (jade.escape(null == (jade_interp = train.dueIn) ? "" : jade_interp)) + "</span></div><!--a(href='/central-line/' + train.destination.replace(/ /g, '-').toLowerCase())--><!--span.destination=train.destination + ' - ' + train.id--><span class=\"destination\">" + (jade.escape(null == (jade_interp = train.destination) ? "" : jade_interp)) + "</span><!--span.platform=train.platform--><br/><span class=\"detail\">" + (jade.escape(null == (jade_interp = train.location) ? "" : jade_interp)) + "</span></li>");
}}.call(this,"train" in locals_for_with?locals_for_with.train:typeof train!=="undefined"?train:undefined));;return buf.join("");
};
},{"jade/runtime":13}],9:[function(require,module,exports){
'use strict';

function makeKey(stationCode, direction, id) {
    return stationCode + '.platforms.' + direction + '.trains["' + id + '"]';
}

var train = module.exports = function(stationCode, direction, id, $el, bus) {
    var key = makeKey(stationCode, direction, id);
    this.stationCode = stationCode;
    this.direction = direction;
    this.id = id;
    this.bus = bus;
    this.bus.on(key, function($el, change) {
        var $node;
        switch(change.property) {
            case 'location' :
                $node = $el.find('.detail');
                $node.addClass('changed');
                setTimeout(function() {
                    $node.html(change.newValue);
                }, 500);
                setTimeout(function() {
                    $node.removeClass('changed');
                }, 1000);
                break;
            case  'dueIn' :
                $node = $el.find('.due');
                $node.addClass('changed');
                setTimeout(function() {
                    $node.html(change.newValue);
                }, 500);
                setTimeout(function() {
                    $node.removeClass('changed');
                }, 1000);
                break;
        }
    }.bind(null, $el));
};

train.prototype.destroy = function() {
    var key = makeKey(this.stationCode, this.direction, this.id);
    this.bus.off(key);
};
},{}],10:[function(require,module,exports){
'use strict';

var tubes = module.exports = function($el, bus) {
    this.$el = $el;
    bus.on('station', this.focus.bind(this));
    bus.on('zoom:out', this.zoomOut.bind(this));
    bus.on('search:highlight', this.highlight.bind(this));
};

tubes.prototype.focus = function(station) {
    console.log('station', station);

    this.$el.attr('data-station', station.code);
    this.$el.find('li.active').removeClass('active');
    $('html, body').animate({scrollTop : 0}, 500);
    $('li.' + station.code ).addClass('active');
    setTimeout(function() {
        $('ul.line li  a.point').removeClass('point');
        $('ul.line li.' + station.code + ' a').addClass('point');
    }, 1250);
};

tubes.prototype.unfocus = function() {
    $('ul.line li  a.point').removeClass('point');
    this.$el.find('li.active').removeClass('active');
};

tubes.prototype.highlight = function(stations) {
    var self = this;
    self.$el.find('.active').removeClass('active');
    stations.forEach(function(station) {
        self.$el.find('.' + station).addClass('active');
    });
};

tubes.prototype.zoomOut = function() {
    this.$el.attr('data-station', '');
    this.unfocus();
};
},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
module.exports = require('./backbone-events-standalone');

},{"./backbone-events-standalone":11}],13:[function(require,module,exports){
(function (global){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"about\"><div class=\"floater\"><div class=\"container\"><h3>About</h3><p>This site was made by <a href=\"http://simonmcmanus.com\">Simon McManus</a>.</p><p>It makes extensive use of <a href=\"http://csstubemap.co.uk\">csstubemap.co.uk</a> from <a href=\"http://www.johngalantini.com/\">John Galantini</a>.</p><p>If you have any questions please contact me via email: \"mcmanus.simon@gmail.com\" or by making issues on the github page.</p><p>The source code is available at <a href=\"http://github.com/simonmcmanus\">http://github.com/simonmcmanus</a></p></div></div></div>");;return buf.join("");
};
},{"jade/runtime":13}],15:[function(require,module,exports){
'use strict';

var template = require('./about.jade');

var about = module.exports = function(NT) {
    NT.page('/about', function(context) {
        if(!context.init) {
            NT.activePage = 'about';
            $('.page').attr('id', 'about');
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        NT.bus.trigger('zoom:out');
    });
    console.log('homepage init');
}


about.prototype.destroy = function(callback) {
    setTimeout(callback, 500);
};
},{"./about.jade":14}],16:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

;return buf.join("");
};
},{"jade/runtime":13}],17:[function(require,module,exports){
'use strict';

var template = require('./home.jade');

var home = module.exports = function(NT) {
    NT.page('/', function() {
        console.log('in home')
        NT.bus.trigger('zoom:out');
        NT.activePage = 'home';
        $('.page').attr('id', 'home');
        $('#content').html(template({
            tubes: {
                currentStationCode: 'HOME'
            }
        }));
//        $('#content').removeClass('hideTop');
    });
    return this;
};

home.prototype.destroy = function(callback) {
    callback();
    console.log('desory home');
}
},{"./home.jade":16}],18:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"settings hide\"><form method=\"get\" action=\"/\"><input class=\"stationSearch\"/><!--//if station--></form></div><div class=\"clear\"></div>");;return buf.join("");
};
},{"jade/runtime":13}],19:[function(require,module,exports){
'use strict';

var template = require('./search.jade');

var switcherComp = require('../../components/station-switcher/station-switcher.js');

var search = module.exports = function(NT) {
    NT.page('/search', function(context) {
        NT.activePage = 'search';
        if(!context.init) {
            NT.bus.trigger('zoom:out');
            $('.page').attr('id', 'search');
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        new switcherComp($('div.settings'), bus);
        setTimeout(function() {
            $('input').eq(1).focus();
        }, 500);
    });
};


search.prototype.destroy = function(callback) {
    setTimeout(callback, 500);
};
},{"../../components/station-switcher/station-switcher.js":4,"./search.jade":18}],20:[function(require,module,exports){
'use strict';

var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});
var page = require('../../public/libs/page.js');

var tubesComponent = require('../../components/tubes/tubes.js');
var SearchPage = require('../search/search');
var HomePage = require('../home/home');
var StationPage = require('../station/station');
var AboutPage = require('../about/about');

var NT = {
    bus: bus,
    page: page,
    activePage: null,
    pages: {}
};

page(function(context, next) {
    var nextCalled = false;
    if(!context.init && NT.activePage) {
        $('#content').addClass('hideTop');
        if(NT.pages[NT.activePage].destroy) {
            console.log('do destroy::::');
            NT.pages[NT.activePage].destroy(next);
            nextCalled = true;
        }
    }
    if(!nextCalled){
        next();
    }
});


$(document).ready(function() {
    new tubesComponent($('#map-container'), bus);
    // init all the pages.

    NT.pages = {
        home: new HomePage(NT, socket),
        station: new StationPage(NT, socket),
        search: new SearchPage(NT, socket),
        about: new AboutPage(NT, socket)
    };

    page();
    bus.trigger('document:ready');
});

// allows page change to be triggered by an event.
bus.on('page:load', function(path) {
    page(path);
});

var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
} else {
    url = 'http://localhost/';
}

var socket = io(url);

},{"../../components/tubes/tubes.js":10,"../../node_modules/backbone-events-standalone":12,"../../public/libs/page.js":23,"../about/about":15,"../home/home":17,"../search/search":19,"../station/station":22}],21:[function(require,module,exports){
module.exports={
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
}
},{}],22:[function(require,module,exports){
'use strict';
var stationComp = require('../../components/station/station.js');
var floaterComp = require('../../components/floater/floater.js');
var urlCodes = require('./station-url-codes.json');
var activeStation = null;

var station = module.exports = function(NT, socket) {
    var self = this;
    self.bus = NT.bus;
    NT.page('/:line/:stationName', function(context) {
        self.setup();

        if(!context.init) {
            self.bus.trigger('loader:show');

            $('#content').removeClass('hideTop');
            var stationCode = urlCodes[context.params.stationName];
            self.getStationData(context.canonicalPath, function(data) {
                $('#content').html(data);
                self.bus.trigger('loader:show');
                self.setup();
                self.bus.trigger('station', {code: stationCode});
            });
        }
        // console.log('got for station /line/station');


        bus.trigger('router:station', context);
        if(context.init) {
            listen({
                code: urlCodes[context.params.stationName]
            }, socket);
        } else {

            $('.page').attr('id', 'station');
            bus.trigger('station', {
                slug: context.params.stationName,
                code: urlCodes[context.params.stationName]
            });
        }
        $('#content').removeClass('hideTop');

    });
    return this;
};


station.prototype.setup = function() {
    new stationComp($('#station'), this.bus);
    new floaterComp($('#floater'), this.bus);
};

station.prototype.destroy = function(callback) {
    console.log('1');
    callback();

};


station.prototype.getStationData = function(path, callback) {
    var self = this;
    $('.page').attr('id', 'station');
    $.ajax({
        url: path + '?ajax=true' ,
        headers: {
            //'Accept': 'application/json',
            'X-PJAX': 'true'
        },
        complete: function(xhr, status) {
            if(status === 'error') {
                console.log("ERRROR");
                callback(true);
            }
        },
        success: function(data) {
            
            callback(data);
//            console.log(data);
            // self.bus.trigger('nextTrain:gotStationData', data);
            // self.bus.trigger('error:hide');
            // // todo: remove timeout.
            // setTimeout(function() {
            //     self.bus.trigger('loader:hide');
            // }, 500);
        }
    });
};

station.prototype.errorCallback = function(stationCode) {
    this.$el.find('.trains').empty();
    this.$el.find('.error').html(templateError({stationCode: stationCode}));
    this.bus.trigger('error:show');
}

function listen(station, socket) {
    activeStation = station.code;
    console.log('listening to', activeStation);
    socket.on('station:' + station.code , function(changes) {
        changes.forEach(function(change) {
            if(change.parent) {
                console.log('sending', change.parent, change)
                bus.trigger(change.parent, change);
            }
        });
   });
};


// var stopListening = function(socket) {
// };




// bus.on('station', function(station) {
//     console.log('stop listening', activeStation);
//     socket.off('station:' + activeStation);
//     activeStation = null;
// });


// bus.on('nextTrain:gotStationData', function(station) {
//     listen(station, socket);
// });





},{"../../components/floater/floater.js":2,"../../components/station/station.js":6,"./station-url-codes.json":21}],23:[function(require,module,exports){
(function (global){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[20]);
