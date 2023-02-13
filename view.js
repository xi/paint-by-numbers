import * as utils from './utils.js';

export class View {
    constructor(canvas, frame) {
        this.canvas = canvas;
        this.frame = frame;
        this.ctx = canvas.getContext('2d');
        this.zoom = 1;
        this.dx = 0;
        this.dy = 0;
    }

    refreshSize() {
        var rect = this.canvas.getBoundingClientRect();

        this.dx += (rect.width - this.canvas.width) / 2;
        this.dy += (rect.height - this.canvas.height) / 2;

        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            this.frame.canvas,
            this.dx,
            this.dy,
            this.frame.canvas.width * this.zoom,
            this.frame.canvas.height * this.zoom,
        );
    }
}

View.prototype.render = utils.throttle(View.prototype.render, 'animation');
