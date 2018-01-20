var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var submit = $('.submit');
var sigData = $('#sig');
var firstName = $('#firstname');
var lastName = $('#lastname');
var hasSigned = false;




//Reset x & y
$(canvas).on('mousedown', function(event) {
    var x, y;

//Locate cursor, draw line and then reset x and y
    $(canvas).on('mousemove', function(e) {
        var offsetX = e.offsetX;
        var offsetY = e.offsetY;


        ctx.StrokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(offsetX, offsetY);
        x = offsetX;
        y = offsetY;
        ctx.stroke();


    });
});


//Stop drawing when mouse is released. Confirm signature has been signed.
$(canvas).on('mouseup', function(e) {
    $(canvas).off('mousemove');
    hasSigned = true;
});


//submit form tag


//Check if canvas has been signed. If so, return value of canvas. Else alert user and send error.
submit.on('click', function(e) {
    if (hasSigned == true) {
        var dataURL = canvas.toDataURL();
        sigData.val(dataURL);
    } else {
        alert('Please sign the damn thing');
    }


});
