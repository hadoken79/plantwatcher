const dbService = require('../services/dbService');

const renderDashboard = (req, res) => {
    res.render('index', {
        title: 'Plant-Watcher',
        loginActive: false,
        loginFailed: req.body.loginFailed,
    });
};

module.exports = {
    renderDashboard,
};
