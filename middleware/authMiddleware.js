const permissionCheck = (req, res, next) => {

    if (req.session.isLoggedIn !== true) {
        //res.status(401);
        //res.render('not-authorized');
        res.redirect('/login');
    } else {
        next();
    }

}

module.exports = permissionCheck;
