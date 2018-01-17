var express = require('express');
var hb = require('express-handlebars');
//Body parser gives you req.body
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var https = require('https');
var path = require('path');
var database = require('./database.js');
var middleware = require('./middleware.js');
var cookieSession = require('cookie-session');
var secrets = require('./secrets.json');
var bcrypt = require('bcryptjs');
var app = express();
const csurf = require('csurf');



//Module imports
var showSignees = database.showSignees;
var addLogin = database.addLogin;
var getSignature = database.getSignature;
var checkCookie = middleware.checkCookie;
var hashPassword = middleware.hashPassword;
var checkPassword = middleware.checkPassword;
var getDetails = database.getDetails;
var addSignature = database.addSignature;
var addProfile = database.addProfile;
var addCookie = middleware.addCookie;
var getCity = database.getCity;
var profileInfo = database.profileInfo;
var updateUsersTable = database.updateUsersTable;







app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('port', (process.env.Port || 8080));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieSession({
    secret: secrets.secret,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
// app.use(csurf());


// csrfToken: req.csrfToken();




//If no URL, redirect to home
app.get('/', function(req, res) {
    res.redirect('/register');
});

//If cookie present, redirect to thankyou page, otherwise present homepage
app.get('/register', function(req, res) {
    if (req.session.hiddensig) {
        res.redirect('/petition/signed');
    } else {
        res.render('register', {
            // csrfToken: req.csrfToken()
        });
    }
});


//Update database with input fields and assign cookie, then redirect to thankyou page.
app.post('/register', function(req, res) {
    hashPassword(req.body.password)
        .then(hashedPassword => {
            addLogin(req.body.firstname, req.body.lastname, req.body.email, hashedPassword)
                .then((sigId) => {
                    req.session.hiddensig = sigId;
                    req.session.user = {
                        first_name: req.session.user,
                        last_name: req.session.lastname,
                        id: req.session.hiddensig,
                        hasSignedned: false
                    };
                    res.redirect('profile');
                })
                .catch(() => {
                    console.log("error");
                });
        });
});


app.get('/profile', checkCookie, function(req, res) {
    res.render('profile', {
    });
});

app.post('/profile', function(req, res) {
    addProfile(req.body.age, req.body.city, req.body.homepage, req.session.hiddensig)
        .then(() => {
            console.log("Redirecting to login");
            res.redirect('login');
        });
});

app.get('/login', function(req, res) {
    console.log("At login", req.session.user);
    res.render('login', {
    });
});

app.post('/login', function(req, res) {
    getDetails(req.body.email)
        .then((results) => {
            // console.log(results.rows[0]);
            checkPassword(req.body.password, results.rows[0].hashed_pass)
                .then(doesMatch => {
                    if (doesMatch) {
                        console.log('does match', results.rows);
                        req.session.user = {
                            first_name: results.rows[0].first,
                            last_name: results.rows[0].last, email: results.rows[0].email, id:
                            results.rows[0].id
                        };
                        console.log("After adding id", req.session.user);
                        if(results.rows[0].signature) {
                            req.session.user.hasSigned = true;
                            // console.log("Post login if", req.session.user);

                            res.redirect('/petition/signed');
                        } else {
                            // console.log("Post login, else", req.session.user);

                            console.log("Password matches!, redirecting to sign");
                            res.redirect('/petition');
                        }
                    } else {
                        console.log("something went wrong with your login :(");
                        res.render('login');
                    }
                })
                .catch(() => {
                    console.log("doesMatch catch");
                })
        })
        .catch(() => {
            console.log("checkemail catch");
        });
});


//A check to see if logged in user currently has a signature in place... Currently not WORKING
/*
app.get('/petition', function(req, res) {
    console.log("Signing??");
    console.log(getSignature(req.cookies.id));
    if (getSignature(req.cookies.id)) {
        console.log("If works");
        res.redirect('/signed');
    } else {
        console.log('else works');
        res.render('petition', {
        });
    }
});
*/



app.get('/petition', checkCookie, function(req, res) {
    if (req.session.user.hasSigned == true) {
        console.log("Already has a signture, redirect please")
        console.log("Before signing", req.session.user);
        res.redirect('/petition/signed')
    } else {
        console.log("After getting to signing page", req.session.user);
        console.log("No signature, sign the damn thing", req.session.user);
        res.render('petition', {
        });
    }
});

app.post('/petition', function(req, res) {
    console.log("After posting signature", req.session.user);
    addSignature(req.body.hiddensig[0], req.session.user.id)
        .then(() => {
            console.log("THENTHENTHENTHEN");
            req.session.user.hasSigned = true;
            res.redirect('/petition/signed');
        })
        .catch(() => {
            console.log("Server side signature add catch");
        });

});


///SIGN OUT NOT WORKING PROPERLY. COOKIE DELETES AND THEN COMES BACK ON REDIRECT
app.get('/signout', function(req, res) {
    req.cookies.id = null;

    res.redirect('/register');

});



//
//Get thankyou page. Call function from module to retrieve signature.
app.get('/petition/signed', checkCookie, function(req, res) {
    getSignature(req.session.user.id).then((results) => {
        console.log();
        console.log("After signing", req.session.user);
        res.render('signed', {
            signature: results.rows[0].signature
        });
    })
        .catch(() => {
            console.log("Trying to find your signature, catch");
        });
});

app.get('/profile/edit', checkCookie, function(req, res) {
    console.log(req.body);
    console.log(req.session.user);
    var firstName = req.session.user.first_name;
    var lastName = req.session.user.last_name;
    var email = req.session.user.email;

    profileInfo(req.session.user.id).then((results) => {
        // var firstName = results.rows[0].first;
        // var lastName = results.rows[0].last;
        // var email = results.rows[0].email;
        var age = results.rows[0].age;
        var homepage = results.rows[0].url;
        var city = results.rows[0].city;
        res.render('profileedit', {
            first: firstName,
            last: lastName,
            email: email,
            age: age,
            homepage: homepage,
            city: city
        });
    })
        .catch(() => {
            console.log("Profile load error");
        });
});

app.post('/profile/edit', function(req, res) {
    updateUsersTable(req.body.firstname, req.body.lastname, req.body.email, req.body.password, req.session.user.id)
        .then(() => {
            console.log("Made it to the server!");
            req.session.user.first_name = req.body.firstname;
            req.session.user.last_name = req.body.lastname;
            req.session.user.email = req.body.email;

            console.log("After updating", req.session.user);
            res.redirect('/profile/edit');
        })
        .catch(() => {
            console.log("no luck this time :(");
        });

});

//Get signees page. Reverse order so the last signed appears on top.
app.get('/petition/signers', checkCookie, function(req, res) {
    showSignees().then((results) => {
        var signees = results.rows;
        // var homepage = results.rows[0].url;
        // var city = results.rows[0].city;
        // var age = results.rows[0].age;

        signees.reverse();

        res.render('signers', {
            signatures: signees,
            // Homepages: homepage,
            // cities: city,
            // signersAge: age
        });
    });
});

// app.get('/signatures' + '/' + homepage, checkCookie, function(req, res) {
//     console.log("get homepage");
// });

app.get('/signers/:cityname', function(req, res) {
    var city = req.params.cityname;



    getCity(city)
        .then((results) => {

            console.log("City got");
            var signees = results.rows;
            var homepage = results.rows[0].url;
            var age = results.rows[0].age;
            res.render('getcity', {
                signatures: signees,
                // Homepages: homepage,
                // signersAge: age
            });
        })
        .catch(() => {
            console.log('no city got');
        });
});

// var city = req.params.cityname

app.listen(app.get('port'), () => console.log("Listening on port 8080"));


//
// addLogin(req.body.firstname, req.body.lastname, req.body.hiddensig).then((sigId) => {
//     console.log(req.body.hiddensig);
//     req.session.hiddensig = sigId;
//     res.redirect('signed');
// })
// //If anything is wrong with entering data, return error message
//     .catch(() => {
//         res.render('home', {
//             error: true
//         });
//     });
