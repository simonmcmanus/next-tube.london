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
