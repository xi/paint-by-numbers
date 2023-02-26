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
        this.pencil = 1;
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
        this.pencil = 1;
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

    transform(old1, old2, new1, new2, old_view) {
        var cx_old = (old1.x + old2.x) / 2;
        var cy_old = (old1.y + old2.y) / 2;
        var cx_new = (new1.x + new2.x) / 2;
        var cy_new = (new1.y + new2.y) / 2;

        var dx_old = old1.x - old2.x;
        var dy_old = old1.y - old2.y;
        var d_old = Math.sqrt(dx_old * dx_old + dy_old * dy_old);

        var dx_new = new1.x - new2.x;
        var dy_new = new1.y - new2.y;
        var d_new = Math.sqrt(dx_new * dx_new + dy_new * dy_new);

        // move center
        this.dx = old_view.dx + cx_new - cx_old;
        this.dy = old_view.dy + cy_new - cy_old;

        // change zoom and keep center
        this.zoom = old_view.zoom;
        this.setZoom(cx_new, cy_new, old_view.zoom * d_new / d_old);
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
