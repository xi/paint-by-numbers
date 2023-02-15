export var throttle = function(fn) {
    var called = false;
    return function() {
        if (!called) {
            called = true;
            requestAnimationFrame(() => {
                called = false;
                fn.apply(this);
            });
        }
    };
};

export class View {
    constructor(canvas, frame) {
        this.canvas = canvas;
        this.frame = frame;
        this.ctx = canvas.getContext('2d');
        this.zoom = 1;
        this.dx = 0;
        this.dy = 0;
        this.mouse = null;
        this.prevMouse = null;
        this.pencil = 0;
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
        this.mouse = null;
        this.prevMouse = null;
        this.pencil = 0;
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

    draw() {
        if (this.mouse) {
            var [x, y] = this.toFrameXY(...this.mouse);
            if (this.prevMouse) {
                var [x2, y2] = this.toFrameXY(...this.prevMouse);
                this.frame.drawLine(x2, y2, x, y, this.pencil);
            } else {
                this.frame.setPixel(x, y, this.pencil);
            }
            this.prevMouse = this.mouse;
        }
    }

    render() {
        this.draw();

        this.dx = Math.min(this.dx, this.canvas.width / 2);
        this.dy = Math.min(this.dy, this.canvas.height / 2);
        this.dx = Math.max(this.dx, this.canvas.width / 2 - this.frame.canvas.width * this.zoom);
        this.dy = Math.max(this.dy, this.canvas.height / 2 - this.frame.canvas.height * this.zoom);

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

View.prototype.render = throttle(View.prototype.render);
