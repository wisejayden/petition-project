// Created middleware module.

//If user tries to go to page when they do not have a cookie ,redirect them to the home page.

var bcrypt = require('bcryptjs');

module.exports.checkCookie = function requireSignature(req, res, next) {
    if (!req.session.user) {
        res.redirect('/register');
    } else {
        next();
    }
};

//Add cookie function not working
/*
module.exports.addCookie = function (sessionId, first, last, sigId) {
    sessionId = {
        first_name: first,
        last_name: last,
        sig_id: sigId
    };
};
*/


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
