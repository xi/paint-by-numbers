var input = document.querySelector('input');

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var offcanvas = document.createElement('canvas');
var octx = offcanvas.getContext('2d');

var data;
var pencil = 0;

var zoom = 1;
var dx = 0;
var dy = 0;

var onAnimation = function(fn) {
    var called = false;
    return () => {
        if (!called) {
            called = true;
            window.requestAnimationFrame(() => {
                fn();
                called = false;
            });
        }
    };
};

var file2img = function(file) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        var url = URL.createObjectURL(file);

        img.onerror = err => {
            URL.revokeObjectURL(url);
            reject(err);
        };
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.src = url;
    });
};

var img2data = function(img, scale) {
    var _canvas = document.createElement('canvas');
    _canvas.height = Math.round(img.height * scale);
    _canvas.width = Math.round(img.width * scale);
    var _ctx = _canvas.getContext('2d');
    _ctx.drawImage(img, 0, 0, _canvas.width, _canvas.height);
    return _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
};

var round = function(c) {
    return Math.floor(c / 51) * 3;
};

var makecolor = function(a) {
    return '#'
        + round(a[0]).toString(16)
        + round(a[1]).toString(16)
        + round(a[2]).toString(16);
};

var sRGB = function(c) {
    var x = round(c) / 15;
    if (x < 0.04045) {
        return x / 12.92;
    } else {
        return Math.pow((x + 0.055) / 1.055, 2.4);
    }
};

var makeContrast = function(a) {
    var l = 0.2126 * sRGB(a[0]) + 0.7152 * sRGB(a[1]) + 0.0722 * sRGB(a[2]);
    return l > 0.18 ? '#000' : '#fff';
}

var analyze = function(img) {
    var c, i, j;
    var colors = ['white'];
    var contrasts = ['black'];
    var out = [];
    for (i = 0; i < img.data.length; i += 4) {
        c = makecolor(img.data.slice(i, i + 3));
        j = colors.indexOf(c);
        if (j === -1) {
            j = colors.length;
            colors.push(c);
            contrasts.push(makeContrast(img.data.slice(i, i + 3)));
        }
        out.push(j);
    }
    return {
        width: img.width,
        height: img.height,
        colors: colors,
        contrasts: contrasts,
        data: out,
    };
};

var setPixel = function(x, y, color) {
    var i = y * data.width + x;
    octx.fillStyle = data.colors[color];
    octx.fillRect(x * 10, y * 10, 10, 10);
    if (color !== data.data[i]) {
        octx.fillStyle = data.contrasts[color];
        octx.fillText(data.data[i], x * 10 + 5, y * 10 + 5);
    }
};

input.addEventListener('change', () => {
    file2img(input.files[0]).then(img => {
        // FIXME: configurable size
        data = analyze(img2data(img, 100 / img.width));
        offcanvas.width = data.width * 10;
        offcanvas.height = data.height * 10;
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';

        zoom = canvas.height / offcanvas.height * 0.8;
        dx = (canvas.width - offcanvas.width * zoom) / 2;
        dy = (canvas.height - offcanvas.height * zoom) / 2;

        // FIXME: zoom to fit and center

        var x, y;
        for (y = 0; y < data.height; y++) {
            for (x = 0; x < data.width; x++) {
                setPixel(x, y, 0);
            }
        }

        render();
    });
});

var resizeCanvas = function() {
    var rect = canvas.getBoundingClientRect();

    dx += (rect.width - canvas.width) / 2;
    dy += (rect.height - canvas.height) / 2;

    canvas.width = rect.width;
    canvas.height = rect.height;

    render();
};

var render = onAnimation(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offcanvas, dx, dy, offcanvas.width * zoom, offcanvas.height * zoom);
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('wheel', event => {
    var rect = canvas.getBoundingClientRect();
    var cx = event.clientX - rect.x;
    var cy = event.clientY - rect.y;

    var ocx = (cx - dx) / zoom;
    var ocy = (cy - dy) / zoom;

    zoom *= Math.pow(2, -event.deltaY / 100 / 100);

    dx = cx - ocx * zoom;
    dy = cy - ocy * zoom;

    render();
});

window.addEventListener('keydown', event => {
    // FIXME: kinetic movement;
    var step = 10;
    if (event.key === 'w') {
        dy += step;
    } else if (event.key === 'a') {
        dx += step;
    } else if (event.key === 's') {
        dy -= step;
    } else if (event.key === 'd') {
        dx -= step;
    } else if (event.key === 'q') {
        pencil -= 1;
    } else if (event.key === 'e') {
        pencil += 1;
    }
    render();
});

var onClick = function(event) {
    if (event.buttons & 1) {
        var rect = canvas.getBoundingClientRect();
        var cx = event.clientX - rect.x;
        var cy = event.clientY - rect.y;

        var ocx = (cx - dx) / zoom;
        var ocy = (cy - dy) / zoom;

        var x = Math.floor(ocx / 10);
        var y = Math.floor(ocy / 10);

        if (x >= 0 && x < data.width && y >= 0 && y < data.height) {
            setPixel(x, y, pencil);
            render();
        }
    }
};

window.addEventListener('mousemove', onClick);
window.addEventListener('mousedown', onClick);
