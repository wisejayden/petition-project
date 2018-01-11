var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:funkychicken:funky@localhost:5432/cities');

function getCity(cityName) {
    return db
        .query(
            //Use array to secure database against Sequel Injection
            `SELECT city, population FROM cities WHERE city = $1 AND population = $2`,
            [cityName, 3610156]
        )
        .then(function(results) {
            return results.rows[0];
        })
        .catch(function(err) {
            console.log(err);
        });
}
// createuser funkychicken -sP
