
var spicedPg = require('spiced-pg');

var db = spicedPg(process.env.DATABASE_URL || 'postgres:dbadmin:spiced@localhost:5432/petition');


module.exports.profileInfo = function(id) {
    return db
        .query(
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
