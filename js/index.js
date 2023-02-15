import { Frame } from './frame.js';
import { View } from './view.js';
import { loadImage } from './loader.js';
import { Animation } from './kinetic.js';

var loader = document.querySelector('.loader');
var palette = document.querySelector('.palette');
var canvas = document.querySelector('canvas');

var frame = new Frame();
var view = new View(canvas, frame);

var moveX = new Animation((value, dt) => {
    view.dx += value * dt * 2;
    view.render();
});
var moveY = new Animation((value, dt) => {
    view.dy += value * dt * 2;
    view.render();
});

var setupPalette = function(image) {
    palette.innerHTML = '';
    for (var i = 0; i < image.colors.length; i++) {
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'pencil';
        radio.value = i;
        radio.addEventListener('change', event => {
            view.pencil = parseInt(event.target.value, 10);
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
        view.pencil = color;
        palette.pencil.value = color;
        palette.querySelector(':checked').parentElement.scrollIntoView();
    }
};

loader.addEventListener('submit', event => {
    event.preventDefault();
    var width = parseInt(loader.width.value, 10);
    loadImage(loader.file, width).then(image => {
        setupPalette(image);
        setPencil(0);

        frame.setImage(image);
        view.reset();

        moveX.reset();
        moveY.reset();
    });
});

window.addEventListener('resize', () => view.refreshSize());

window.addEventListener('keydown', event => {
    if (['w', 'ArrowUp'].includes(event.key)) {
        moveY.set(1);
    } else if (['a', 'ArrowLeft'].includes(event.key)) {
        moveX.set(1);
    } else if (['s', 'ArrowDown'].includes(event.key)) {
        moveY.set(-1);
    } else if (['d', 'ArrowRight'].includes(event.key)) {
        moveX.set(-1);
    } else if (['q', 'PageUp'].includes(event.key)) {
        setPencil(view.pencil - 1);
    } else if (['e', 'PageDown'].includes(event.key)) {
        setPencil(view.pencil + 1);
    } else if (event.key === '+') {
        view.setZoom(view.canvas.width / 2, view.canvas.height / 2, view.zoom * 1.2);
    } else if (event.key === '-') {
        view.setZoom(view.canvas.width / 2, view.canvas.height / 2, view.zoom / 1.2);
    }
});

window.addEventListener('keyup', event => {
    if (['w', 'ArrowUp'].includes(event.key)) {
        moveY.unset(1);
    } else if (['a', 'ArrowLeft'].includes(event.key)) {
        moveX.unset(1);
    } else if (['s', 'ArrowDown'].includes(event.key)) {
        moveY.unset(-1);
    } else if (['d', 'ArrowRight'].includes(event.key)) {
        moveX.unset(-1);
    }
});

canvas.addEventListener('wheel', event => {
    view.setZoom(event.offsetX, event.offsetY, view.zoom * Math.pow(2, -event.deltaY / 2000));
});

var onMouse = function(event) {
    if (event.buttons & 1) {
        view.mouse = [event.offsetX, event.offsetY];
        view.render();
    } else {
        view.mouse = null;
        view.prevMouse = null;
    }
};

canvas.addEventListener('mousemove', onMouse);
canvas.addEventListener('mousedown', onMouse);
canvas.addEventListener('mouseup', onMouse);
