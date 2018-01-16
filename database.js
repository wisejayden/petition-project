
var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:dbadmin:spiced@localhost:5432/petition');



module.exports.addLogin = function (first, last, email, hashedPass) {
    console.log("HEllo 3");
    return db
        .query(
            `INSERT INTO users (first, last, email, hashed_pass) VALUES ($1, $2, $3, $4) RETURNING id`,
            [first || null, last || null, email || null, hashedPass || null]
        )
        .then(function(results) {
            const sigId = results.rows[0].id;
            console.log("INSERTION SUCCESSFUL")
            return sigId;
        })
        .catch(() => {
            console.log("database error");
        })
};

module.exports.checkEmail = function (email) {
    return db
        .query(
            `SELECT * FROM users
            LEFT JOIN signatures
            ON users.id = signatures.user_id WHERE email = $1`,
            [email]
        )
        .then(results => {
            console.log(results);
            // console.log(results.rows[0].hashed_pass);
            console.log("Check email successful");
            return results;
        })
        .catch(() =>{
            console.log("CheckEmailCatch");
        });
};



//fix this
module.exports.addSignature = function(sig, id) {
    console.log('wassup');
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
        })
};



//ALso need from user_profiles age, city, url

module.exports.showSignees = function showSignees () {
    return db
        .query(
            `SELECT * FROM users
            FULL OUTER JOIN user_profiles
            ON users.id = user_profiles.user_id`
        )
        // .query(
        //     `SELECT first, last FROM petition`
        // )
        .then(function(results) {
            console.log(results);
            return results;
        })
        .catch(function(err) {
            console.log("second err", err);
        });
};



module.exports.getSignature = function getSignature(id) {
    return db
        .query(
            `SELECT signature FROM signatures WHERE id = $1`,
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

module.exports.addProfile = function(age, city, homepage, id) {
    return db
        .query(
            `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)`,
            [age, city, homepage, id]
        )
        .then(() => {
            console.log("Profile add success!");
        })
        .catch(() => {
            console.log('Profile add fail');
        });
};

module.exports.getCity = function(city) {
    return db
        .query(
            `SELECT * FROM user_profiles WHERE city = ($1)`,
            [city]
        )
        .then(() => {
            console.log("Get that city");
        })
        .catch(() => {
            console.log('You aint got that city');
        });
};
