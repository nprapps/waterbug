var $source;
var canvas;
var imageLoader;
var ctx;
var image;

var handleImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(event){
        image = event.target.result
        renderCanvas();
    }
    reader.readAsDataURL(e.target.files[0]);
}

var renderCanvas = function() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var img = new Image();
    img.onload = function(){
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img,0,0);

        var logo = new Image();

        logo.onload = function(){
            ctx.drawImage(logo, canvas.width - (logo.width + 20), canvas.height - (logo.height + 20));
        }

        if (canvas.width >= 800) {
            logo.src = 'img/npr-logo.png';
        } else if (canvas.width < 800) {
            logo.src = 'img/npr-logo-100.png';
        }

        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
        ctx.font = 'normal 12pt Helvetica Neue';
        ctx.fillText($source.val(), 20, canvas.height - 20);
    }

    img.src = image;
}

$(document).ready(function() {
    $source = $('#source');
    canvas = $('#imageCanvas')[0];
    imageLoader = $('#imageLoader');
    ctx = canvas.getContext('2d');

    $source.on('keyup', renderCanvas);
    imageLoader.on('change', handleImage);
});