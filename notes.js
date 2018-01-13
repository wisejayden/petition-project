//Two things you need a javascript
//Submit takes first name Last name and canvas.

//c.toDataURL();
//save to a hidden field in order to send to server


//Create a database, create a table.
//
CREATE TABLE signatures(
    id SERIAL primary key,
    first VARCHAR(300) NOT NULL,
    last VARCHAR(300) NOT NULL,
    signature TEXT NOT NULL
)

//twox input
// One input type="hidden"
//canvas
//body parser
//Templates, static directory, javascript for canvas, set up routes

app.get('/petition', function(req, res) {
    res.render('petition')
})
app.post('/petition', function (req, red) {
    db.signPetition(req.body.first, req.body.last, req.body.sig)
        .catch(function(errMessage) {
            res.render('petition', {
                errorMessage: errMessage
            })
        })
})





//// NOtes day 2

GET /Petition
POST /Petition
GET /thanks
GET /signers
GET /(redirects/petitions) (maybe)


SELECT * FROM petition (query);



app.get('/thanks', requireSignature, (req, res) => {

});


function requireSignature(req, res, next) {
    if (!req.cookies.signed) {
        res.redirect('/petition');
    } else {
        next();
    }
}
