var express = require('express');
var hb = require('express-handlebars');
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
var checkEmail = database.checkEmail;
var addSignature = database.addSignature;
var addProfile = database.addProfile;
var addCookie = middleware.addCookie;







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
    console.log("Hello 0");
    if (req.session.hiddensig) {
        res.redirect('/thanks');
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
                    console.log("Registered correctly, awaiting redirect id is", sigId);
                    req.session.hiddensig = sigId;
                    req.session.user = {
                        first_name: req.session.user,
                        last_name: req.session.lastname,
                        id: sigId,
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
    res.render('profile', {
    });
});

app.post('/profile', function(req, res) {
    console.log("req.body", req.body);
    console.log("req.session.hiddensig", req.session.hiddensig);
    addProfile(req.body.age, req.body.city, req.body.homepage, req.session.hiddensig)
        .then(() => {
            console.log("Alright now what?");
            res.redirect('login');
        });
});

app.get('/login', function(req, res) {
    res.render('login', {
    });
});

app.post('/login', function(req, res) {
    checkEmail(req.body.email)
        .then(results => {
            checkPassword(req.body.password, results.rows[0].hashed_pass)
                .then(doesMatch => {
                    if (doesMatch) {
                        console.log("Results.rows[0].id", results.rows[0].id);
                        req.session.user = {
                            first_name: results.rows[0].first,
                            last_name: results.rows[0].last, id: results.rows[0].id
                        };

                        console.log("Password matches!");
                        res.redirect('/petition');
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
        res.redirect('/thanks');
    } else {
        console.log('else works');
        res.render('petition', {
        });
    }
});
*/

app.get('/petition', checkCookie, function(req, res) {
    if (req.session.user.sig_id) {
        res.redirect('/thanks')
    } else {
        res.render('petition', {
        });
    }
});

app.post('/petition', function(req, res) {
    console.log("After signing", req.session)
    addSignature(req.body.hiddensig[0], req.session.hiddensig)
        .then(() => {
            res.redirect('/thanks');
        })
        .catch(() => {
            console.log("Server side signature add");
        });

});


///SIGN OUT NOT WORKING PROPERLY. COOKIE DELETES AND THEN COMES BACK ON REDIRECT
app.get('/signout', function(req, res) {
    req.cookies.id = null;

    res.redirect('/register');

});



//
//Get thankyou page. Call function from module to retrieve signature.
app.get('/thanks', checkCookie, function(req, res) {
    getSignature(req.session.hiddensig).then((results) => {
        res.render('thanks', {
            signature: results.rows[0].signature
        });
    })
        .catch(() => {
            console.log("Catch my thankyou");
        });
});

//Get signees page. Reverse order so the last signed appears on top.
app.get('/signatures', checkCookie, function(req, res) {
    showSignees().then((results) => {
        var signees = results.rows;
        signees.reverse();

        res.render('signatures', {
            signatures: signees
        });
    });

});

app.listen(app.get('port'), () => console.log("Listening on port 8080"));


//
// addLogin(req.body.firstname, req.body.lastname, req.body.hiddensig).then((sigId) => {
//     console.log(req.body.hiddensig);
//     req.session.hiddensig = sigId;
//     res.redirect('thanks');
// })
// //If anything is wrong with entering data, return error message
//     .catch(() => {
//         res.render('home', {
//             error: true
//         });
//     });
