import { Frame } from './frame.js';
import { View } from './view.js';
import { loadImage } from './loader.js';
import * as utils from './utils.js';

var input = document.querySelector('input');
var palette = document.querySelector('.palette');
var canvas = document.querySelector('canvas');

var frame = new Frame();
var view = new View(canvas, frame);

var pencil = 0;
var speed_x = 0;
var speed_y = 0;

var setupPalette = function(image) {
    palette.innerHTML = '';
    for (var i = 0; i < image.colors.length; i++) {
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'pencil';
        radio.value = i;
        radio.addEventListener('change', event => {
            pencil = parseInt(event.target.value, 10);
        });

        var span = document.createElement('span');
        span.textContent = i;
        span.style.color = image.contrasts[i];
        span.style.backgroundColor = image.colors[i];

        var label = document.createElement('label');
        label.append(radio);
        label.append(span);

        palette.append(label);
    }
    view.refreshSize();
};

var setPencil = function(color) {
    if (color >= 0 && color < palette.pencil.length) {
        pencil = color;
        palette.pencil.value = pencil;
        palette.querySelector(':checked').parentElement.scrollIntoView();
    }
};

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

input.addEventListener('change', () => {
    // FIXME: configurable size
    loadImage(input, 80).then(image => {
        setupPalette(image);
        setPencil(0);

        frame.setImage(image);
        view.reset();

        speed_x = 0;
        speed_y = 0;
    });
});

window.addEventListener('resize', () => view.refreshSize());

canvas.addEventListener('wheel', event => {
    view.setZoom(event.offsetX, event.offsetY, view.zoom * Math.pow(2, -event.deltaY / 100 / 100));
    view.render();
});

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

var last_click = null;

var onClick = function(event) {
    if (event.buttons & 1) {
        var [x, y] = view.toFrameXY(event.offsetX, event.offsetY);

        if (last_click) {
            frame.drawLine(last_click.x, last_click.y, x, y, pencil);
        } else {
            frame.setPixel(x, y, pencil);
        }
        last_click = {x: x, y: y};

        view.render();
    } else {
        last_click = null;
    }
};

canvas.addEventListener('mousemove', onClick);
canvas.addEventListener('mousedown', onClick);
