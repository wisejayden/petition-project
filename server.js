var express = require('express');
var hb = require('express-handlebars');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var https = require('https');
var path = require('path');
var database = require('./database.js');
var middleware = require('./middleware.js');
var cookieSession = require('cookie-session');
var secrets = require('./secrets.json');

var showSignees = database.showSignees;
var addSignature = database.add;
var getSignature = database.getSignature;
var checkCookie = middleware.checkCookie;







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
    res.redirect('/home');
});

//If cookie present, redirect to thankyou page, otherwise present homepage
app.get('/home', function(req, res) {
    if (req.session.hiddensig) {
        res.redirect('/thanks');
    } else {
        res.render('home', {
        });
    }
});


//Update database with input fields and assign cookie, then redirect to thankyou page.
app.post('/home', function(req, res) {
    console.log(req.body);
    addSignature(req.body.firstname, req.body.lastname, req.body.hiddensig).then((sigId) => {
        console.log(req.body.hiddensig);
        req.session.hiddensig = sigId;
        res.redirect('thanks');
    })
    //If anything is wrong with entering data, return error message
        .catch(() => {
            res.render('home', {
                error: true
            });
        });
});

//Get thankyou page. Call function from module to retrieve signature.
app.get('/thanks', checkCookie, function(req, res) {
    getSignature(req.session.hiddensig).then((results) => {
        res.render('thanks', {
            signature: results.rows[0].signature
        });
    });
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
