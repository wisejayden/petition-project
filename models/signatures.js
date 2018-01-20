
var spicedPg = require('spiced-pg');

var db = spicedPg(process.env.DATABASE_URL || 'postgres:dbadmin:spiced@localhost:5432/petition');

module.exports.addSignature = function(sig, id) {
    return db
        .query(
            `INSERT INTO signatures (signature, user_id) VALUES ($1, $2)`,
            [sig, id]
        )
        .then(() => {
            console.log("Correctly updating signature");
            // const sigId = results.rows[0].id;
            // console.log(sigId);
            // return sigId;
        })
        .catch(() => {
            console.log('This seems to run sometimes...');
        });
};


module.exports.getSignature = function getSignature(id) {
    return db
        .query(
            `SELECT signature FROM signatures WHERE user_id = $1`,
            [id]
            // `SELECT * FROM signatures`
        )
        .then(function(results) {
            console.log("getSignature then");
            return results;
        })
        .catch(function() {
            console.log("Get signature catch");
        });
};




module.exports.deleteSignature = function(id) {
    return db
        .query(
            `DELETE FROM signatures
            WHERE user_id = $1`,
            [id]
        )
        .then(() => {
            console.log("Delete signature query then");
        })
        .catch(() => {
            console.log("Delete signature query catch");
        });
};
