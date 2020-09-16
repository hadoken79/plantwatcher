const renderDashboard = (req, res) => {
    res.render('index', {
        title: 'Plant-Watcher',
    });
};

module.exports = {
    renderDashboard,
};