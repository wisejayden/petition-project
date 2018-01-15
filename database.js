
var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:dbadmin:spiced@localhost:5432/petition');

module.exports.addLogin = function (first, last, email, hashedPass) {
    return db
        .query(
            `INSERT INTO petition (first, last, email, hashed_pass) VALUES ($1, $2, $3, $4) RETURNING id`,
            [first || null, last || null, email || null, hashedPass || null]
        )
        .then(function(results) {
            console.log("INSERTION SUCCESSFUL")
        })
        .catch(() => {
            console.log("database error");
        })
};

module.exports.checkEmail = function (email) {
    return db
        .query(
            `SELECT * FROM petition WHERE email = $1`,
            [email]
        )
        .then(results => {
            // console.log(results.rows[0].hashed_pass);
            console.log("Check email successful");
            return results;
        })
        .catch(() =>{
            console.log("CheckEmailCatch");
        });
};

module.exports.addSignature = function(sig, id) {
    console.log('wassup');
    return db
        .query(
            `UPDATE petition SET signature = $1 WHERE id = $2`,
            [sig, id]
        )
        .then((results) => {
            console.log("Correctly updating signature");
            // const sigId = results.rows[0].id;
            // console.log(sigId);
            // return sigId;
        })
        .catch(() => {
            console.log('This seems to run sometimes...');
        })
};





module.exports.showSignees = function showSignees () {
    return db
        .query(
            `SELECT first, last FROM petition`
        )
        .then(function(results) {
            return results;
        })
        .catch(function(err) {
            console.log("second err", err);
        });
};



module.exports.getSignature = function getSignature(id) {
    return db
        .query(
            `SELECT signature FROM petition WHERE id = $1`,
            [id]

        )
        .then(function(results) {
            // console.log("Signature retrieval results", results);
            return results;
        })
        .catch(function(err) {
            console.log("Third err", err);
        });
};
