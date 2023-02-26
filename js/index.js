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

var pointers = [];
var pointersStartState = null;

var setupPalette = function(image) {
    palette.innerHTML = '';
    for (var i = 1; i < image.colors.length; i++) {
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
    if (color >= 1 && color <= palette.pencil.length) {
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
        setPencil(1);

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

canvas.addEventListener('pointerdown', event => {
    if (pointers.length < 2 && (event.buttons & 1 || event.pointerType !== 'mouse')) {
        canvas.setPointerCapture(event.pointerId);

        // clone because offsetX/Y change to 0 on the original event
        pointers.push({
            id: event.pointerId,
            x: event.offsetX,
            y: event.offsetY,
        });

        pointersStartState = {
            pointers: pointers.map(e => ({x: e.x, y: e.y})),
            view: {
                dx: view.dx,
                dy: view.dy,
                zoom: view.zoom,
            },
        };
    }
});

canvas.addEventListener('pointermove', event => {
    var i = pointers.findIndex(e => e.id === event.pointerId);
    if (i !== -1) {
        pointers[i].x = event.offsetX;
        pointers[i].y = event.offsetY;

        if (pointers.length === 1) {
            view.mouse = [event.offsetX, event.offsetY];
            view.render();
        } else {
            view.mouse = null;
            view.prevMouse = null;
            view.transform(
                pointersStartState.pointers[0],
                pointersStartState.pointers[1],
                pointers[0],
                pointers[1],
                pointersStartState.view,
            );
        }
    }
});

var pointerup = function(event) {
    var i = pointers.findIndex(e => e.id === event.pointerId);
    if (i !== -1) {
        if (pointers.length === 1) {
            view.mouse = [event.offsetX, event.offsetY];
            view.draw();

            view.prevMouse = null;
            view.mouse = null;
            view.render();
        }
        pointers = [];
        pointersStartState = null;
    }
};

canvas.addEventListener('pointerup', pointerup);
canvas.addEventListener('pointercancel', pointerup);
