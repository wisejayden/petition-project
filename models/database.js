
var spicedPg = require('spiced-pg');

var db = spicedPg(process.env.DATABASE_URL || 'postgres:dbadmin:spiced@localhost:5432/petition');














//ALso need from user_profiles age, city, url



//fix this








// SELECT * FROM users
// FULL OUTER JOIN user_profiles
// ON users.id = user_profiles.user_id

// WHERE LOWER(city) = LOWER ($1)
