var $source;
var canvas;
var imageLoader;
var ctx;
var imageFilename;
var img;
var $save;
var $textColor;
var imageHeight;

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

    for (var i = 0; i < $textColor.length; i++) {
        if ($textColor.eq(i).is(':checked')) {
            var textColor = $textColor.eq(i).val();
        }
    }

    img = new Image();

    img.onload = function(){
        var imageAspect = img.width / img.height;
        canvas.width = 600;
        canvas.height = 600 / imageAspect;
        ctx.drawImage(img, 0, 0, 600, canvas.height);

        var logo = new Image();

        logo.onload = function(){
            ctx.drawImage(logo, canvas.width - (logo.width + 20), canvas.height - (logo.height + 20));
        }

        logo.src = 'assets/npr-' + textColor + '.png';

        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillStyle = textColor;
        ctx.font = 'normal 12pt Gotham';
        ctx.fillText($source.val(), 20, canvas.height - 20);
    }

    img.src = imageFilename || 'assets/test.png';
}

var onSaveClick = function() {
    /// create an "off-screen" anchor tag
    var link = document.createElement('a'),
        e;

    /// the key here is to set the download attribute of the a tag
    link.download = 'download.png';

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    link.href = canvas.toDataURL();

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {

        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
                         0, 0, 0, 0, 0, false, false, false,
                         false, 0, null);

        link.dispatchEvent(e);

    } else if (link.fireEvent) {
        link.fireEvent("onclick");
    }
}

$(document).ready(function() {
    $source = $('#source');
    canvas = $('#imageCanvas')[0];
    imageLoader = $('#imageLoader');
    ctx = canvas.getContext('2d');
    $save = $('.save-btn');
    $textColor = $('input[name="textColor"]');

    $source.on('keyup', renderCanvas);
    imageLoader.on('change', handleImage);
    $save.on('click', onSaveClick);
    $textColor.on('change', renderCanvas);

    renderCanvas();
});