// DOM elements
var $source;
var $photographer;
var $save;
var $textColor;
var $logo;
var $crop;
var $logoColor;
var $imageLoader;
var $canvas;
var canvas;
var $qualityQuestions;
var $copyrightHolder;
var $dragHelp;

// state
var scaledImageHeight;
var fixedWidth = 1000;
var dy = 0;
var logoDimensions = {
    'npr': {
        w: 150,
        h: 52
    },
    'music': {
        w: 320,
        h: 85
    }

};
var elementPadding = 40;
var imageFilename;
var currentCrop = 'original';
var currentLogo = 'npr';
var currentLogoColor = 'white';
var currentTextColor = 'white';
var currentCopyright;
var credit = 'Belal Khan/Flickr'


// JS objects
var ctx;
var img = new Image();
var logo = new Image();


var onDocumentLoad = function(e) {
    $source = $('#source');
    $photographer = $('#photographer');
    $canvas = $('#imageCanvas');
    canvas = $canvas[0];
    $imageLoader = $('#imageLoader');
    ctx = canvas.getContext('2d');
    $save = $('.save-btn');
    $textColor = $('input[name="textColor"]');
    $logo = $('input[name="logo"]');
    $crop = $('input[name="crop"]');
    $logoColor = $('input[name="logoColor"]');
    $qualityQuestions = $('.quality-question');
    $copyrightHolder = $('.copyright-holder');
    $dragHelp = $('.drag-help');

    img.src = APP_CONFIG.DEFAULT_IMAGE;
    img.onload = renderCanvas;
    logo.onload = renderCanvas;

    $photographer.on('keyup', renderCanvas);
    $source.on('keyup', renderCanvas);
    $imageLoader.on('change', handleImage);
    $save.on('click', onSaveClick);
    $textColor.on('change', onTextColorChange);
    $logo.on('change', onLogoChange);
    $logoColor.on('change', onLogoColorChange);
    $crop.on('change', onCropChange);
    $canvas.on('mousedown', onDrag);
    // $qualityQuestions.on('change', onCheckboxChange);
    $copyrightHolder.on('change', onCopyrightChange);


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
        canvas.width - (logoDimensions[currentLogo]['w'] + elementPadding),
        currentLogo === 'npr'? elementPadding : elementPadding - 15,
        logoDimensions[currentLogo]['w'],
        logoDimensions[currentLogo]['h']
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

    if (currentCopyright) {
        credit = buildCreditString();
    }

    ctx.fillText(
        credit,
        elementPadding,
        canvas.height - elementPadding
    );

    validateForm();
}

var buildCreditString = function() {
    var creditString;

    if ($copyrightHolder.val() === 'npr') {
        if ($photographer.val() === '') {
            creditString = 'NPR';
        } else {
            creditString = $photographer.val() + '/NPR';
        }
    } else if ($copyrightHolder.val() === 'freelance') {
        creditString = $photographer.val() + ' for NPR';
        if ($photographer.val() !== '') {
            $photographer.parents('.form-group').removeClass('has-warning');
        } else {
            $photographer.parents('.form-group').addClass('has-warning');
        }
    } else {
        if ($photographer.val() !== '') {
            creditString = $photographer.val() + '/' + $source.val();
        } else {
            creditString = $source.val();
        }

        if ($source.val() !== '') {
            $source.parents('.form-group').removeClass('has-warning');
        } else {
            $source.parents('.form-group').addClass('has-warning');
        }
    }

    return creditString;
}

var validateForm = function() {
    if ($('.has-warning').length === 0 && currentCopyright) {
        $save.removeAttr('disabled');
        $("body").off("contextmenu", "canvas");
    } else {
        $save.attr('disabled', '');
        $("body").on("contextmenu", "canvas", function(e) {
            return false;
        });
    }
}

/*
* Handle dragging the image for crops when applicable
*/
var onDrag = function(e) {
    e.preventDefault();
    var originY = e.clientY;
    var startY = dy;

    if (currentCrop === 'original') {
        return;
    }

    function update(e) {
        if (Math.abs(e.clientY - originY) > 1) {
            dy = startY - (originY - e.clientY);

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
    logo.src = 'assets/logo-' + currentLogo + '-' + currentLogoColor + '.svg';
}

/*
* Download the image on save click
*/
var onSaveClick = function(e) {
    e.preventDefault();

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
* Handle logo radio button clicks
*/
var onLogoChange = function(e) {
    currentLogo = $(this).val();

    loadLogo();
    renderCanvas();
}

/*
* Handle crop radio button clicks
*/
var onCropChange = function() {
    currentCrop = $(this).val();

    if (currentCrop !== 'original') {
        $canvas.addClass('is-draggable');
        $dragHelp.show();
    } else {
        $canvas.removeClass('is-draggable');
        $dragHelp.hide();
    }

    renderCanvas();
}

// var onCheckboxChange = function() {
//     console.log('fire');
//     var checkedCount = 0;

//     for (var i = 0; i < $qualityQuestions.length; i++) {
//         if ($qualityQuestions.eq(i).is(':checked')) {
//             checkedCount++;
//         }
//     }
// }

var onCopyrightChange = function() {
    currentCopyright = $copyrightHolder.val();
    $photographer.parents('.form-group').removeClass('has-warning');
    $source.parents('.form-group').removeClass('has-warning');

    if (currentCopyright === 'npr') {
        $photographer.removeAttr('disabled');
        $source.attr('disabled', '')
    } else if (currentCopyright === 'freelance') {
        $photographer.removeAttr('disabled');
        $source.attr('disabled', '')
        $photographer.parents('.form-group').addClass('has-warning');
    } else if (currentCopyright === 'wire' || currentCopyright === 'third-party') {
        $photographer.removeAttr('disabled');
        $source.removeAttr('disabled');
        $source.parents('.form-group').addClass('has-warning');
    } else {
        credit = '';
        $photographer.attr('disabled', '');
        $source.attr('disabled', '')
    }

    renderCanvas();
}

$(onDocumentLoad);