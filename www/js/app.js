var $source;
var canvas;
var imageLoader;
var ctx;
var imageFilename;
var img;
var imageHeight;
var $save;
var $textColor;
var $crop;
var imageHeight;
var fixedWidth = 1000;
var dy;

var handleImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(event){
        imageFilename = event.target.result
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

    for (var i = 0; i < $crop.length; i++) {
        if ($crop.eq(i).is(':checked')) {
            var crop = $crop.eq(i).val();
        }
    }

    img = new Image();

    img.onload = function(){
        var imageAspect = img.width / img.height;
        canvas.width = fixedWidth;
        if (crop === 'original') {
            canvas.height = fixedWidth / imageAspect;
            imageHeight = canvas.height;
        } else {
            canvas.height = fixedWidth / (16/9)
            imageHeight = fixedWidth / imageAspect;
        }

        dy = dy || -((imageHeight - canvas.height) / 2);

        if (crop === 'original') {
            ctx.drawImage(img, 0, 0, fixedWidth, imageHeight);
        } else {
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
    }

    img.src = imageFilename || 'assets/test.png';

    var logo = new Image();

    logo.onload = function(){
        if (textColor === 'white') {
            ctx.globalAlpha = "0.7";
        }
        ctx.drawImage(logo, canvas.width - (logo.width + 20), canvas.height - (logo.height + 20));

        ctx.globalAlpha = "1";

        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillStyle = textColor;
        ctx.font = 'normal 24pt "Gotham SSm"';

        if (textColor === 'white') {
            ctx.shadowColor = 'black';
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.shadowBlur = 10;
        }

        ctx.fillText($source.val(), 20, canvas.height - 20);
    }

    logo.src = 'assets/npr-' + textColor + '.png';
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

  function update(e) {
    dy = -((dy + (originY - e.clientY)) * 0.7);
    renderCanvas();
  }

  // Perform drag sequence:
    $(document).on('mousemove.drag', update)
    .on('mouseup.drag', function(e) {
      $(document).off('mouseup.drag mousemove.drag');
      update(e);
    });
}

$(document).ready(function() {
    $source = $('#source');
    canvas = $('#imageCanvas')[0];
    imageLoader = $('#imageLoader');
    ctx = canvas.getContext('2d');
    $save = $('.save-btn');
    $textColor = $('input[name="textColor"]');
    $crop = $('input[name="crop"]');

    $source.on('keyup', renderCanvas);
    imageLoader.on('change', handleImage);
    $save.on('click', onSaveClick);
    $textColor.on('change', renderCanvas);
    $crop.on('change', renderCanvas);

    $(canvas).on('mousedown', onDrag);

    renderCanvas();
});