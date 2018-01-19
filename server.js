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
// var secrets = require('./secrets.json');
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
var updateUser_profilesTable = database.updateUser_profilesTable;
var deleteSignature = database.deleteSignature;
var checkProfile = middleware.checkProfile;
var checkForSignature = middleware.checkForSignature;
var checkForUser = middleware.checkForUser;







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
    secret: process.env.SESSION_SECRET || require('./secrets.json').secret,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
app.use(csurf());

// csrfToken: req.csrfToken();




//If no URL, redirect to home
app.get('/', function(req, res) {
    res.redirect('/register');
});

//If cookie present, redirect to thankyou page, otherwise present homepage
app.get('/register',checkForUser, function(req, res) {
    console.log(req.session);
    res.render('register', {
        Token: req.csrfToken()
    });

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
                        hasSigned: false
                    };
                    res.redirect('profile');
                })
                .catch(() => {
                    console.log("error");
                });
        });
});


app.get('/profile', checkCookie, function(req, res) {
    console.log('req.session.user', req.session.user);
    if (req.session.user.profile) {
        res.redirect('petition');
    } else {
        console.log("Checking for hiddensig", req.session.user);
        res.render('profile', {
            Token: req.csrfToken()
        });
    }
});




app.post('/profile', function(req, res) {
    addProfile(req.body.age, req.body.city, req.body.homepage, req.session.user.id)
        .then(() => {
            console.log("Redirecting to login");
            req.session.user.profile = true;
            console.log("After posting profile, print out user", req.session.user);
            res.redirect('petition');
        });
});



app.get('/login', checkForUser, function(req, res) {
    console.log("If there is no user you should login", req.session);
    res.render('login', {
        Token: req.csrfToken()
    });
});



//Use email to query for details, check password against hashed password.
app.post('/login', function(req, res) {

    getDetails(req.body.email)
        .then((results) => {
            checkPassword(req.body.password, results.rows[0].hashed_pass)
            //If it does match, assign cookie containing user info
                .then(doesMatch => {
                    if (doesMatch) {
                        req.session.user = {
                            first_name: results.rows[0].first,
                            last_name: results.rows[0].last, email: results.rows[0].email, id:
                            results.rows[0].id
                        };
                        profileInfo(req.session.user.id)
                            .then((results) => {
                                console.log("THIS IS WHAT I AM TESTING!!!", results.rows.length)
                                if(results.rows.length == 0) {
                                    console.log("Profile not filled, redirect to profile");
                                    res.redirect('profile');
                                } else {
                                    req.session.user.profile = true;
                                    getSignature(req.session.user.id)
                                        .then((results) => {
                                            if(results.rows.length == 0) {
                                                res.redirect('/petition');
                                            } else {
                                                req.session.user.hasSigned = true;
                                                res.redirect('/petition/signed');
                                            }
                                        })
                                        .catch (() => {
                                            console.log("Password matches but caught after getSignature");
                                        });
                                }
                            })
                        // Check if signature is present.

                    } else {
                        console.log("something went wrong with your login :(");
                        res.render('login');
                    }
                })
                .catch(() => {
                    console.log("doesMatch catch");
                });
        })
        .catch(() => {
            console.log("checkemail catch");
        });

});





app.get('/petition', checkCookie, checkProfile,  function(req, res) {
    console.log("GETTING TO petition page", req.session.user);
    if (req.session.user.hasSigned == true) {
        console.log("Already has a signture, redirect please");
        res.redirect('/petition/signed');
    } else {
        console.log("No signature, sign the damn thing");
        res.render('petition', {
            Token: req.csrfToken()
        });
    }
});

app.post('/petition', function(req, res) {
    addSignature(req.body.hiddensig[0], req.session.user.id)
        .then(() => {
            req.session.user.hasSigned = true;
            res.redirect('/petition/signed');
        })
        .catch(() => {
            console.log("Server side signature add catch");
        });

});

//
//Get thankyou page. Call function from module to retrieve signature.
app.get('/petition/signed', checkCookie, checkProfile, checkForSignature, function(req, res) {
    getSignature(req.session.user.id).then((results) => {
        console.log("After signing", req.session.user);
        res.render('signed', {
            signature: results.rows[0].signature
        });
    })
        .catch(() => {
            console.log("Trying to find your signature, catch");
        });
});

//Max Jones id 23
app.get('/petition/delete/', checkCookie, checkForSignature, function(req, res) {
    deleteSignature(req.session.user.id)
        .then(() => {
            req.session.user.hasSigned = false;
            res.redirect('/petition');
        })
        .catch(() => {
            console.log("Signature removal fail");
            res.redirect('/petition/signed');
        });
});

//Get profile info and use handlebars to insert data onto html page.
app.get('/profile/edit', checkCookie, checkProfile, function(req, res) {
    var {first_name, last_name, email, id} = req.session.user;

    profileInfo(id).then((results) => {
        var {age, url, city} = results.rows[0];
        res.render('profileedit', {
            Token: req.csrfToken(),
            first: first_name,
            last: last_name,
            email: email,
            age: age,
            homepage: url,
            city: city
        });
    })
        .catch(() => {
            console.log("Profile load error");
        });
});




app.post('/profile/edit', checkCookie, function(req, res) {
    updateUser_profilesTable(req.body, req.session.user.id)
        .then(() => {
            console.log("User profile added, then redirect");
        })
        .catch(() => {
            console.log("Profile not added, something is up");
        });

    //If password field has been filled, hash the string and update user table. Then save new user info to cookie.
    let {password, firstname, lastname, email} = req.body;
    if (!password == '') {
        hashPassword(password)
            .then((hashedPassword) => {
                password = hashedPassword;
                updateUsersTable(firstname, lastname, email, password, req.session.user.id)
                    .then(() => {
                        req.session.user.first_name = firstname;
                        req.session.user.last_name = lastname;
                        req.session.user.email = email;
                        console.log("Updated user table with new password");
                        res.redirect('/petition/signed');
                    })
                    .catch(() => {
                        console.log("Did not successfully Update user table with new password");
                    });
            });
    } else {
        updateUsersTable(firstname, lastname, email, password, req.session.user.id)
            .then(() => {
                req.session.user.first_name = firstname;
                req.session.user.last_name = lastname;
                req.session.user.email = email;
                console.log("Updated user table without new password");
                res.redirect('/petition/signed');

            })
            .catch(() => {
                console.log("Did not successfully Update user table without new password");
            });
    }
});



//Get signees page. Reverse order so the last signed appears on top.
app.get('/petition/signers', checkCookie, checkProfile, checkForSignature, function(req, res) {
    showSignees().then((results) => {
        var signees = results.rows;
        // var homepage = results.rows[0].url;
        // var city = results.rows[0].city;
        // var age = results.rows[0].age;

        signees.reverse();

        res.render('signers', {
            Token: req.csrfToken(),
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

app.get('/signers/:cityname', checkCookie, checkProfile, checkForSignature, function(req, res) {
    var city = req.params.cityname;



    getCity(city)
        .then((results) => {

            console.log("City got");
            var signees = results.rows;
            var homepage = results.rows[0].url;
            var age = results.rows[0].age;
            res.render('getcity', {
                Token: req.csrfToken(),
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


///SIGN OUT NOT WORKING PROPERLY. COOKIE DELETES AND THEN COMES BACK ON REDIRECT
app.get('/signout', function(req, res) {
    req.session = null;
    res.redirect('/register');

});

app.listen(process.env.PORT || app.get('port'), () => console.log("Listening on port 8080"));
