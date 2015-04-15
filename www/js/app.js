var $source;
var canvas;
var imageLoader;
var ctx;
var imageFilename;
var img = new Image();
var logo = new Image();
var imageHeight;
var $save;
var $textColor;
var $crop;
var imageHeight;
var fixedWidth = 1000;
var dy = 0;
var currentCrop = 'original';
var currentTextColor = 'white';

var handleImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(e){
        imageFilename = e.target.result
        img.src = imageFilename
    }
    reader.readAsDataURL(e.target.files[0]);
}

var loadLogo = function() {
    logo.src = 'assets/npr-' + currentTextColor + '.svg';
}

var renderCanvas = function() {
    canvas.width = fixedWidth;

    if (currentCrop !== 'original') {
        canvas.height = fixedWidth / (16/9);
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);

    var imageAspect = img.width / img.height;
    if (currentCrop === 'original') {
        canvas.height = fixedWidth / imageAspect;
        imageHeight = canvas.height;
    } else {
        imageHeight = fixedWidth / imageAspect;
    }


    if (currentCrop === 'original') {
        ctx.drawImage(img, 0, 0, fixedWidth, imageHeight);
    } else {
        ctx.fillStyle = "magenta";
        ctx.fillRect(0, 0, fixedWidth, imageHeight);
        ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            dy,
            fixedWidth,
            imageHeight
        );
    }

    if (currentTextColor === 'white') {
        ctx.globalAlpha = "0.8";
    }

    ctx.drawImage(logo, canvas.width - (150 + 20), canvas.height - (52 + 20), 150, 52);

    ctx.globalAlpha = "1";
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillStyle = currentTextColor;
    ctx.font = 'normal 20pt "Gotham SSm"';

    if (currentTextColor === 'white') {
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.shadowBlur = 10;
    }

    ctx.fillText($source.val(), 20, canvas.height - 30);
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
    link.target = "_blank";

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

var onDrag = function(e) {
    e.preventDefault();
    var originY = e.clientY;

    if (currentCrop === 'original') {
        return;
    }

    function update(e) {
        if (Math.abs(e.clientY - originY) > 1) {
            dy = dy - (originY - e.clientY) * 0.025;
            renderCanvas();
        }
    }

    // Perform drag sequence:
    $(document).on('mousemove.drag', _.debounce(update, 5, true))
        .on('mouseup.drag', function(e) {
            $(document).off('mouseup.drag mousemove.drag');
            update(e);
        });
}

var onTextColorChange = function() {
    for (var i = 0; i < $textColor.length; i++) {
        if ($textColor.eq(i).is(':checked')) {
            currentTextColor = $textColor.eq(i).val();
        }
    }

    loadLogo();
    renderCanvas();
}

var onCropChange = function() {
    for (var i = 0; i < $crop.length; i++) {
        if ($crop.eq(i).is(':checked')) {
            currentCrop = $crop.eq(i).val();
        }
    }

    renderCanvas();
}

$(document).ready(function() {
    $source = $('#source');
    canvas = $('#imageCanvas')[0];
    imageLoader = $('#imageLoader');
    ctx = canvas.getContext('2d');
    $save = $('.save-btn');
    $textColor = $('input[name="textColor"]');
    $crop = $('input[name="crop"]');

    img.src = 'assets/test.png';
    img.onload = renderCanvas;
    logo.onload = renderCanvas;

    $source.on('keyup', renderCanvas);
    imageLoader.on('change', handleImage);
    $save.on('click', onSaveClick);
    $textColor.on('change', onTextColorChange);
    $crop.on('change', onCropChange);
    $(canvas).on('mousedown', onDrag);

    loadLogo();
    renderCanvas();
});