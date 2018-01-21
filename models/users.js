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
            console.log("INSERTION SUCCESSFUL");
            return sigId;
        })
        .catch((error) => {
            throw error;
        });
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
        .catch((error) =>{
            console.log("CheckEmailCatch");
            throw error;
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


module.exports.showSignees = function showSignees () {
    return db
        .query(
            `SELECT * FROM users
            FULL OUTER JOIN user_profiles
            ON users.id = user_profiles.user_id`
        )
        .then(function(results) {
            return results;
        })
        .catch(function() {
            console.log("second err");
        });
};
