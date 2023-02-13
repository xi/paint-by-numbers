import { Frame, PXSIZE } from './frame.js';

var input = document.querySelector('input');
var palette = document.querySelector('.palette');

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var frame = new Frame();

var data;
var pencil = 0;

var zoom = 1;
var dx = 0;
var dy = 0;
var speed_x = 0;
var speed_y = 0;

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
};

var onAnimation = function(fn) {
    var called = false;
    return (...args) => {
        if (!called) {
            called = true;
            window.requestAnimationFrame(() => {
                fn(...args);
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

input.addEventListener('change', () => {
    file2img(input.files[0]).then(img => {
        // FIXME: configurable size
        data = analyze(img2data(img, 80 / img.width));

        frame.setImage(data);

        palette.innerHTML = '';
        for (var i = 0; i < data.colors.length; i++) {
            var label = document.createElement('label');
            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'pencil';
            radio.value = i;
            var span = document.createElement('span');
            span.textContent = i;
            label.append(radio);
            label.append(span);
            span.style.color = data.contrasts[i];
            span.style.backgroundColor = data.colors[i];
            palette.append(label);
            radio.addEventListener('change', event => {
                pencil = parseInt(event.target.value, 10);
            });
        }
        setPencil(0);
        resizeCanvas();

        zoom = canvas.height / frame.canvas.height * 0.8;
        dx = (canvas.width - frame.canvas.width * zoom) / 2;
        dy = (canvas.height - frame.canvas.height * zoom) / 2;

        speed_x = 0;
        speed_y = 0;

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
    ctx.drawImage(frame.canvas, dx, dy, frame.canvas.width * zoom, frame.canvas.height * zoom);
});

var applySpeed = onAnimation(function() {
    dx += speed_x;
    dy += speed_y;
    render();
    speed_x *= 0.85;
    speed_y *= 0.85;
    if (Math.abs(speed_x) > 0.1 || Math.abs(speed_y) > 0.1) {
        setTimeout(applySpeed);
    }
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

var setPencil = function(color) {
    if (color >= 0 && color < data.colors.length) {
        pencil = color;
        palette.pencil.value = pencil;
        palette.querySelector(':checked').parentElement.scrollIntoView();
    }
};

window.addEventListener('keydown', event => {
    // FIXME: kinetic movement;
    var step = 10;
    if (event.key === 'w') {
        speed_y = step;
        applySpeed();
    } else if (event.key === 'a') {
        speed_x = step;
        applySpeed();
    } else if (event.key === 's') {
        speed_y = -step;
        applySpeed();
    } else if (event.key === 'd') {
        speed_x = -step;
        applySpeed();
    } else if (event.key === 'q') {
        setPencil(pencil - 1);
    } else if (event.key === 'e') {
        setPencil(pencil + 1);
    }
    render();
});

var drawLine = function(x1, y1, x2, y2, color) {
    var a, x, y;
    var dx = Math.abs(x1 - x2);
    var dy = Math.abs(y1 - y2);

    if (dx === 0 && dy === 0) {
        frame.setPixel(Math.floor(x1), Math.floor(y1), color);
    }
    if (dx > dy) {
        a = (y1 - y2) / (x1 - x2);
        for (x = Math.floor(Math.min(x1, x2)) + 1; x <= Math.max(x1, x2); x++) {
            y = a * (x - x2) + y2;
            frame.setPixel(x, y, color);
            frame.setPixel(x - 1, y, color);
        }
    } else {
        a = (x1 - x2) / (y1 - y2);
        for (y = Math.floor(Math.min(y1, y2)) + 1; y <= Math.max(y1, y2); y++) {
            x = a * (y - y2) + x2;
            frame.setPixel(x, y, color);
            frame.setPixel(x, y - 1, color);
        }
    }
};

var last_click = null;

var onClick = onAnimation(function(event) {
    if (event.buttons & 1) {
        var rect = canvas.getBoundingClientRect();
        var cx = event.clientX - rect.x;
        var cy = event.clientY - rect.y;

        var ocx = (cx - dx) / zoom / PXSIZE;
        var ocy = (cy - dy) / zoom / PXSIZE;

        if (last_click) {
            drawLine(last_click.x, last_click.y, ocx, ocy, pencil);
        } else {
            frame.setPixel(ocx, ocy, pencil);
        }
        last_click = {x: ocx, y: ocy};

        render();
    } else {
        last_click = null;
    }
});

canvas.addEventListener('mousemove', onClick);
canvas.addEventListener('mousedown', onClick);
