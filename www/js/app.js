// DOM elements
var $source;
var $save;
var $textColor;
var $crop;
var $logoColor;
var $imageLoader;
var $canvas;
var canvas;
var $checkboxes;

// state
var scaledImageHeight;
var fixedWidth = 1000;
var dy = 0;
var logoDimensions = {
    w: 150,
    h: 52
};
var elementPadding = 40;
var imageFilename;
var currentCrop = 'original';
var currentLogoColor = 'white';
var currentTextColor = 'white';

// JS objects
var ctx;
var img = new Image();
var logo = new Image();


var onDocumentLoad = function(e) {
    $source = $('#source');
    $canvas = $('#imageCanvas');
    canvas = $canvas[0];
    $imageLoader = $('#imageLoader');
    ctx = canvas.getContext('2d');
    $save = $('.save-btn');
    $textColor = $('input[name="textColor"]');
    $crop = $('input[name="crop"]');
    $logoColor = $('input[name="logoColor"]');
    $checkboxes = $('input[type="checkbox"]');

    img.src = 'assets/test.png';
    img.onload = renderCanvas;
    logo.onload = renderCanvas;

    $source.on('keyup', renderCanvas);
    $imageLoader.on('change', handleImage);
    $save.on('click', onSaveClick);
    $textColor.on('change', onTextColorChange);
    $logoColor.on('change', onLogoColorChange);
    $crop.on('change', onCropChange);
    $canvas.on('mousedown', onDrag);
    $checkboxes.on('change', onCheckboxChange);

    $("body").on("contextmenu", "canvas", function(e) {
        return false;
    });

    loadLogo();
    renderCanvas();
}

/*
* Draw the image, then the logo, then the text
*/
var renderCanvas = function() {
    // canvas is always the same width
    canvas.width = fixedWidth;

    // if we're cropping, use the aspect ratio for the height
    if (currentCrop !== 'original') {
        canvas.height = fixedWidth / (16/9);
    }

    // clear the canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // determine height of canvas and scaled image, then draw the image
    var imageAspect = img.width / img.height;
    if (currentCrop === 'original') {
        canvas.height = fixedWidth / imageAspect;
        scaledImageHeight = canvas.height;
        ctx.drawImage(
            img,
            0,
            0,
            fixedWidth,
            scaledImageHeight
        );
    } else {
        scaledImageHeight = fixedWidth / imageAspect;
        ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            dy,
            fixedWidth,
            scaledImageHeight
        );
    }

    // set alpha channel, draw the logo
    if (currentLogoColor === 'white') {
        ctx.globalAlpha = "0.8";
    } else {
        ctx.globalAlpha = "0.6";
    }
    ctx.drawImage(
        logo,
        canvas.width - (logoDimensions.w + elementPadding),
        elementPadding,
        logoDimensions.w,
        logoDimensions.h
    );

    // reset alpha channel so text is not translucent
    ctx.globalAlpha = "1";

    // draw the text
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillStyle = currentTextColor;
    ctx.font = 'normal 20pt "Gotham SSm"';

    if (currentTextColor === 'white') {
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 10;
    }

    ctx.fillText(
        $source.val(),
        elementPadding,
        canvas.height - elementPadding
    );
}

/*
* Handle dragging the image for crops when applicable
*/
var onDrag = function(e) {
    e.preventDefault();
    var originY = e.clientY;

    if (currentCrop === 'original') {
        return;
    }

    function update(e) {
        if (Math.abs(e.clientY - originY) > 1) {
            dy = dy - (originY - e.clientY) * 0.025;

            // Prevent dragging image below upper bound
            if (dy > 0) {
                dy = 0;
                return;
            }

            // Prevent dragging image above lower bound
            if (dy < canvas.height - scaledImageHeight) {
                dy = canvas.height - scaledImageHeight;
                return;
            }

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

/*
* Take an image from file input and load it
*/
var handleImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(e){
        imageFilename = e.target.result
        img.src = imageFilename
    }
    reader.readAsDataURL(e.target.files[0]);
}

/*
* Load the logo based on radio buttons
*/
var loadLogo = function() {
    logo.src = 'assets/npr-' + currentLogoColor + '.svg';
}

/*
* Download the image on save click
*/
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

/*
* Handle logo radio button clicks
*/
var onLogoColorChange = function(e) {
    currentLogoColor = $(this).val();

    loadLogo();
    renderCanvas();
}

/*
* Handle text color radio button clicks
*/
var onTextColorChange = function(e) {
    currentTextColor = $(this).val();

    renderCanvas();
}

/*
* Handle crop radio button clicks
*/
var onCropChange = function() {
    currentCrop = $(this).val();

    if (currentCrop !== 'original') {
        $canvas.addClass('is-draggable');
    } else {
        $canvas.removeClass('is-draggable');
    }

    renderCanvas();
}

var onCheckboxChange = function() {
    var checkedCount = 0;

    for (var i = 0; i < $checkboxes.length; i++) {
        if ($checkboxes.eq(i).is(':checked')) {
            checkedCount++;
        }
    }

    if (checkedCount === 3) {
        $save.removeAttr('disabled');
        $("body").off("contextmenu", "canvas");
    } else {
        $save.attr('disabled', '');
        $("body").on("contextmenu", "canvas", function(e) {
            return false;
        });
    }
}

$(onDocumentLoad);