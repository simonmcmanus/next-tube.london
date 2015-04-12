'use strict';

module.exports = function(req, res) {
    if(req.query.station) {
        res.redirect(req.query.station);
    }
};
