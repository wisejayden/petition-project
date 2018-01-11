console.log("Hello this is the server");

var express = require('express');
var hb = require('express-handlebars');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var https = require('https');
var path = require('path');
var myDatabase = require('./database.js').add;




app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.set('port', (process.env.Port || 8080));

app.use(bodyParser.urlencoded({
    extended: false
}));





app.get('/', function(req, res) {

    res.render('home', {

    });
});

app.get('/signatures', function(req, res) {

    res.render('signatures', {

    });
});
//
// if(req.cookies.funky) {
//
// }
//
// res.cookie('funky', 'cookie');

app.post('/', function(req, res) {
    myDatabase(req.body.firstname, req.body.lastname, req.body.hiddensig);
    res.render('submit', {

    });
});


app.listen(app.get('port'), () => console.log("Listening on port 8080"));
