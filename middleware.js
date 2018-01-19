// Created middleware module.

//If user tries to go to page when they do not have a cookie ,redirect them to the home page.

var bcrypt = require('bcryptjs');

module.exports.checkForUser = function (req, res, next) {
    if (req.session.user) {
        console.log("User already logged in");
        res.redirect('/profile');
    } else {
        next();
    }
};

module.exports.checkCookie = function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/register');
    } else {
        next();
    }
};

module.exports.checkProfile = function(req, res, next) {
    if(!req.session.user.profile) {
        res.redirect('/profile');
    } else {
        next();
    }
};
module.exports.checkForSignature = function(req, res, next) {
    if(!req.session.user.hasSigned == true) {
        console.log("You must sign before you can access these pages");
        res.redirect('/petition');
    } else {
        next();
    }
};


module.exports.hashPassword = function (plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};

module.exports.checkPassword = function (textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
};
