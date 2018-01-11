
var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:dbadmin:spiced@localhost:5432/petition');

module.exports.add = function (first, last, sig) {
    return db
        .query(
            `INSERT INTO petition (first, last, signature) VALUES ($1, $2, $3)`,
            [first, last, sig]
        )
        .then(function(results) {
            console.log(first, last, sig);
        })
        .catch(function(err) {
            console.log(err);
        });
};
