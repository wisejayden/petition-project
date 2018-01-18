
var spicedPg = require('spiced-pg');

var db = spicedPg(process.env.DATABASE_URL || 'postgres:dbadmin:spiced@localhost:5432/petition');


module.exports.addLogin = function (first, last, email, hashedPass) {
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

module.exports.getDetails = function (email) {
    return db
        .query(
            `SELECT * FROM users WHERE LOWER (email) = LOWER ($1)`,
            [email]
        )
        .then(results => {
            console.log("getDetails then");

            return results;
        })
        .catch(() =>{
            console.log("CheckEmailCatch");
        });
};





module.exports.profileInfo = function(id) {
    return db
        .query(
            // `SELECT * FROM users
            // FULL OUTER JOIN user_profiles
            // ON users.id = user_profiles.user_id
            // WHERE users.id = $1`,
            // [id]

            `SELECT * FROM user_profiles
            WHERE user_id = ($1)`,
            [id]
        )
        .then((results) => {
            return results;
        })
        .catch(() => {
            console.log("Profile info query error");
        });
};

module.exports.updateUsersTable = function(first, last, email, password, id) {
    if(password === '') {
        return db
            .query(
                `UPDATE users
                SET first = $1, last = $2, email = $3
                WHERE id = $4`,
                [first, last, email, id]
            )
            .then(() => {
                console.log("Update successful!");
            })
            .catch(() => {
                console.log("Update not so successful...");
            });
    } else {
        return db
            .query(
                `UPDATE users
                SET first = $1, last = $2, email = $3, hashed_pass = $4
                WHERE id = $5`,
                [first, last, email, password, id]
            )
            .then(() => {
                console.log("Updated password correctly");
            })
            .catch(() => {
                console.log("Something went wrong with updating your password");
            });
    }
};
module.exports.updateUser_profilesTable = function({age, city, homepage}, id) {
    return db
        .query(
            `UPDATE user_profiles
            SET age = $1, city = $2, url = $3
            WHERE user_id = $4`,
            [age, city, homepage, id]
        )
        .then(() => {
            console.log("Successfully added user profile");
        })
        .catch(() => {
            console.log("Something went wrong with adding the info");
        });
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
            return results;
        })
        .catch(function() {
            console.log("second err");
        });
};

//fix this
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

        )
        .then(function(results) {
            console.log("getSignature then");
            return results;
        })
        .catch(function(err) {
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

module.exports.addProfile = function(age, city, homepage, id) {
    return db
        .query(
            `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)`,
            [age || null, city || null, homepage || null, id]
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

            `SELECT * FROM user_profiles
            JOIN users
            ON user_profiles.user_id = users.id
            WHERE LOWER (city) = LOWER ($1)`,
            [city]
        )
        .then((results) => {

            return results;
        })
        .catch(() => {
            console.log('You aint got that city');
        });
};
// SELECT * FROM users
// FULL OUTER JOIN user_profiles
// ON users.id = user_profiles.user_id

// WHERE LOWER(city) = LOWER ($1)
