
var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:dbadmin:spiced@localhost:5432/petition');

module.exports.add = function (first, last, sig) {
    return db
        .query(
            `INSERT INTO petition (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
            [first || null, last || null, sig || null]
        )
        .then(function(results) {
            const sigId = results.rows[0].id;
            console.log(sigId);
            return sigId;
            // console.log("first, last, sig", first, last, sig);
        });

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



//exports.getSigners


// db.query(); creates a promise
