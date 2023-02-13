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

input.addEventListener('change', () => {
    // FIXME: configurable size
    loadImage(input, 80).then(image => {
        frame.setImage(image);

        palette.innerHTML = '';
        for (var i = 0; i < image.colors.length; i++) {
            var label = document.createElement('label');
            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'pencil';
            radio.value = i;
            var span = document.createElement('span');
            span.textContent = i;
            label.append(radio);
            label.append(span);
            span.style.color = image.contrasts[i];
            span.style.backgroundColor = image.colors[i];
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

canvas.addEventListener('wheel', event => {
    view.setZoom(event.offsetX, event.offsetY, view.zoom * Math.pow(2, -event.deltaY / 100 / 100));
    view.render();
});

var setPencil = function(color) {
    if (color >= 0 && color < palette.pencil.length) {
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

var last_click = null;

var onClick = function(event) {
    if (event.buttons & 1) {
        var [frame_x, frame_y] = view.toFrameXY(event.offsetX, event.offsetY);

        if (last_click) {
            frame.drawLine(last_click.x, last_click.y, frame_x, frame_y, pencil);
        } else {
            frame.setPixel(frame_x, frame_y, pencil);
        }
        last_click = {x: frame_x, y: frame_y};

        view.render();
    } else {
        last_click = null;
    }
};

canvas.addEventListener('mousemove', onClick);
canvas.addEventListener('mousedown', onClick);
