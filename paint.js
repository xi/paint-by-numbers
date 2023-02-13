import { Frame, PXSIZE } from './frame.js';
import { View } from './view.js';
import { loadImage } from './loader.js';
import * as utils from './utils.js';

var input = document.querySelector('input');
var palette = document.querySelector('.palette');

var canvas = document.querySelector('canvas');

var frame = new Frame();
var view = new View(canvas, frame);

var data;
var pencil = 0;

var speed_x = 0;
var speed_y = 0;

input.addEventListener('change', () => {
    // FIXME: configurable size
    loadImage(input, 80).then(image => {
        frame.setImage(image);

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
        view.refreshSize();

        view.zoom = view.canvas.height / frame.canvas.height * 0.8;
        view.dx = (view.canvas.width - frame.canvas.width * view.zoom) / 2;
        view.dy = (view.canvas.height - frame.canvas.height * view.zoom) / 2;

        speed_x = 0;
        speed_y = 0;

        view.render();
    });
});

var applySpeed = utils.throttle(function() {
    view.dx += speed_x;
    view.dy += speed_y;
    view.render();
    speed_x *= 0.85;
    speed_y *= 0.85;
    if (Math.abs(speed_x) > 0.1 || Math.abs(speed_y) > 0.1) {
        setTimeout(applySpeed);
    }
}, 'animation');

window.addEventListener('resize', () => view.refreshSize());
view.refreshSize();

window.addEventListener('wheel', event => {
    var rect = canvas.getBoundingClientRect();
    var cx = event.clientX - rect.x;
    var cy = event.clientY - rect.y;

    var ocx = (cx - view.dx) / view.zoom;
    var ocy = (cy - view.dy) / view.zoom;

    view.zoom *= Math.pow(2, -event.deltaY / 100 / 100);

    view.dx = cx - ocx * view.zoom;
    view.dy = cy - ocy * view.zoom;

    view.render();
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
    view.render();
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

var onClick = utils.throttle(function(event) {
    if (event.buttons & 1) {
        var rect = canvas.getBoundingClientRect();
        var cx = event.clientX - rect.x;
        var cy = event.clientY - rect.y;

        var ocx = (cx - view.dx) / view.zoom / PXSIZE;
        var ocy = (cy - view.dy) / view.zoom / PXSIZE;

        if (last_click) {
            drawLine(last_click.x, last_click.y, ocx, ocy, pencil);
        } else {
            frame.setPixel(ocx, ocy, pencil);
        }
        last_click = {x: ocx, y: ocy};

        view.render();
    } else {
        last_click = null;
    }
}, 'animation');

canvas.addEventListener('mousemove', onClick);
canvas.addEventListener('mousedown', onClick);
