var $source;
var canvas;
var imageLoader;
var ctx;
var image;
var $save;
var $radios;

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

    for (var i = 0; i < $radios.length; i++) {
        if ($radios.eq(i).is(':checked')) {
            var textColor = $radios.eq(i).val();
        }
    }

    var img = new Image();
    img.onload = function(){
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img,0,0);

        var logo = new Image();

        logo.onload = function(){
            ctx.drawImage(logo, canvas.width - (logo.width + 20), canvas.height - (logo.height + 20));
        }

        logo.src = APP_CONFIG.S3_BASE_URL + '/assets/npr-' + textColor + '.png';

        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillStyle = textColor;
        ctx.font = 'normal 12pt Gotham';
        ctx.fillText($source.val(), 20, canvas.height - 20);
    }

    img.src = image;
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
    $radios = $('input[name="textColor"]');

    $source.on('keyup', renderCanvas);
    imageLoader.on('change', handleImage);
    $save.on('click', onSaveClick);
    $radios.on('change', renderCanvas);
});