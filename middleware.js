// Created middleware module.

//If user tries to go to page when they do not have a cookie ,redirect them to the home page.
module.exports.checkCookie = function requireSignature(req, res, next) {
    if (!req.session.hiddensig) {
        res.redirect('/home');
    } else {
        next();
    }
};
