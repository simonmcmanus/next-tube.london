'use strict';

function hideLoader($el) {
    $el.removeClass('loading');
}

function showLoader($el) {
    $el.addClass('loading');
}

function showError($el) {
    $el.addClass('error');
    resize($el);
    hideLoader($el);
}

function hideError($el) {
    $el.removeClass('error');
}

function resize($el) {
    $el.height($el.find('.container').height());
    //$el.width($el.find('.container').width());
}

module.exports = {
    'loader:show': showLoader,
    'error:show': showError,
    'error:hide': hideError,
    'loader:hide': hideLoader,
    'resize': resize
};
