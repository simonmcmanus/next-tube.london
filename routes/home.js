module.exports = function(req, res) {
    res.render('../pages/home/home.jade', {
        tubes: {
            currentStationCode: 'HOME'
        }
    });
};