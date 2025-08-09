export class Frame {
    constructor() {
        this.pxsize = 15;
        this.image = null;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setImage(image) {
        this.image = image;
        if (this.image) {
            this.canvas.width = image.width * this.pxsize;
            this.canvas.height = image.height * this.pxsize;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.fill(0);
        }
    }

    _setPixel(x, y, color) {
        var i = y * this.image.width + x;
        this.ctx.fillStyle = this.image.colors[color];
        this.ctx.fillRect(
            x * this.pxsize,
            y * this.pxsize,
            this.pxsize,
            this.pxsize,
        );
        if (color !== this.image.data[i]) {
            this.ctx.fillStyle = this.image.contrasts[color];
            this.ctx.font = `${this.pxsize * 0.8}px sans-serif`;
            this.ctx.fillText(
                this.image.data[i],
                (x + 0.5) * this.pxsize,
                (y + 0.5) * this.pxsize,
            );
        }
    }

    setPixel(x, y, color) {
        if (
            this.image
            && x >= 0 && x < this.image.width
            && y >= 0 && y < this.image.height
        ) {
            this._setPixel(Math.floor(x), Math.floor(y), color);
        }
    }

    fill(color) {
        for (var y = 0; y < this.image.height; y++) {
            for (var x = 0; x < this.image.width; x++) {
                this._setPixel(x, y, color);
            }
        }
    }

    drawLine(x1, y1, x2, y2, color) {
        var a, x, y;
        var dx = Math.abs(x1 - x2);
        var dy = Math.abs(y1 - y2);

        if (dx === 0 && dy === 0) {
            this.setPixel(Math.floor(x1), Math.floor(y1), color);
        }
        if (dx > dy) {
            a = (y1 - y2) / (x1 - x2);
            for (x = Math.floor(Math.min(x1, x2)) + 1; x <= Math.max(x1, x2); x++) {
                y = a * (x - x2) + y2;
                this.setPixel(x, y, color);
                this.setPixel(x - 1, y, color);
            }
        } else {
            a = (x1 - x2) / (y1 - y2);
            for (y = Math.floor(Math.min(y1, y2)) + 1; y <= Math.max(y1, y2); y++) {
                x = a * (y - y2) + x2;
                this.setPixel(x, y, color);
                this.setPixel(x, y - 1, color);
            }
        }
    }
}
