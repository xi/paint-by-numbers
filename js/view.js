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

    reset() {
        this.zoom = this.canvas.height / this.frame.canvas.height * 0.8;
        this.dx = (this.canvas.width - this.frame.canvas.width * this.zoom) / 2;
        this.dy = (this.canvas.height - this.frame.canvas.height * this.zoom) / 2;
        this.render();
    }

    toFrameXY(x, y) {
        var frame_x = (x - this.dx) / this.zoom / this.frame.pxsize;
        var frame_y = (y - this.dy) / this.zoom / this.frame.pxsize;

        return [frame_x, frame_y];
    }

    setZoom(stable_x, stable_y, zoom) {
        var [frame_x, frame_y] = this.toFrameXY(stable_x, stable_y);
        this.zoom = zoom;
        this.dx = stable_x - frame_x * zoom * this.frame.pxsize;
        this.dy = stable_y - frame_y * zoom * this.frame.pxsize;
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
