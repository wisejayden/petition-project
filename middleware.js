// Created middleware module.

//If user tries to go to page when they do not have a cookie ,redirect them to the home page.

var bcrypt = require('bcryptjs');

module.exports.checkCookie = function requireSignature(req, res, next) {
    if (!req.cookies.id) {
        res.redirect('/register');
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

module.exports.checkPassword = function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                console.log("checkPasword if");
                reject(err);
            } else {
                console.log("checkPasword else");
                resolve(doesMatch);
            }
        });
    });
};
