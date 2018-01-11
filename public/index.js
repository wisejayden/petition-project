// var fs = require('fs');
var canvas = document.getElementById('canvas');
var submit = $('.submit');
var ctx = canvas.getContext("2d");
var sigData = $('#sig');
var firstName = $('#firstname');
var lastName = $('#lastname');


// const https = require('https');




canvas.addEventListener('mousedown', function(event) {
    var x, y;
    console.log("first", x, y);

    canvas.addEventListener('mousemove', function(e) {
        var offsetX = e.offsetX;
        var offsetY = e.offsetY;

        ctx.StrokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(offsetX, offsetY);
        x = offsetX;
        y = offsetY;
        console.log("second", x, y);

        ctx.stroke();


    });
});
canvas.addEventListener('mouseup', function(e) {
    canvas.removeEventListener('mousedown', function(event) {

    });
});





//submit form tag



submit.on('click', function(e) {
    var dataURL = canvas.toDataURL();
    sigData.val(dataURL);

});
