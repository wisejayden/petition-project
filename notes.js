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
