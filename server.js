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



//Module imports
var showSignees = database.showSignees;
var addLogin = database.addLogin;
var getSignature = database.getSignature;
var checkCookie = middleware.checkCookie;
var hashPassword = middleware.hashPassword;
var checkPassword = middleware.checkPassword;
var checkEmail = database.checkEmail;
var addSignature = database.addSignature;







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







//If no URL, redirect to home
app.get('/', function(req, res) {
    res.redirect('/register');
});

//If cookie present, redirect to thankyou page, otherwise present homepage
app.get('/register', function(req, res) {
    if (req.session.hiddensig) {
        res.redirect('/thanks');
    } else {
        res.render('register', {
        });
    }
});


//Update database with input fields and assign cookie, then redirect to thankyou page.
app.post('/register', checkCookie, function(req, res) {
    hashPassword(req.body.password)
        .then(hashedPassword => {
            addLogin(req.body.firstname, req.body.lastname, req.body.email, hashedPassword)
                .then(() => {
                    res.redirect('login');
                })
                .catch(() => {
                    console.log("error")
                })
        });
});


app.get('/login', function(req, res) {
    res.render('login', {
    });
})

app.post('/login', function(req, res) {

    checkEmail(req.body.email)
        .then(results => {
            checkPassword(req.body.password, results.rows[0].hashed_pass)
                .then(doesMatch => {
                    if (doesMatch) {
                        console.log("Password matches!");
                        res.cookie('id', results.rows[0].id);
                        res.redirect('/petition');
                    } else {
                        console.log("something went wrong with your login :(");
                        res.render('login');
                    }
                });
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
    res.render('petition', {
    });
});

app.post('/petition', function(req, res) {
    addSignature(req.body.hiddensig[0], req.cookies.id)
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
    console.log(req.cookies.id)
    getSignature(req.cookies.id).then((results) => {
        res.render('thanks', {
            signature: results.rows[0].signature
        });
    })
        .catch(() => {
            console.log("Catch my thankyou");
        })
});

//Get signees page. Reverse order so the last signed appears on top.
app.get('/signatures', checkCookie,  function(req, res) {
    showSignees().then((results) => {
        var signees = results.rows;
        signees.reverse();

        res.render('signatures', {
            signatures: signees
        });
    });

});

app.listen(app.get('port'), () => console.log("Listening on port 8080"));
