export var PXSIZE = 12;

export class Frame {
    constructor() {
        this.image = null;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setImage(image) {
        this.image = image;
        if (this.image) {
            this.canvas.width = image.width * PXSIZE;
            this.canvas.height = image.height * PXSIZE;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.fill(0);
        }
    }

    _setPixel(x, y, color) {
        var i = y * this.image.width + x;
        this.ctx.fillStyle = this.image.colors[color];
        this.ctx.fillRect(x * PXSIZE, y * PXSIZE, PXSIZE, PXSIZE);
        if (color !== this.image.data[i]) {
            this.ctx.fillStyle = this.image.contrasts[color];
            this.ctx.fillText(
                this.image.data[i], (x + 0.5) * PXSIZE, (y + 0.5) * PXSIZE
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
}
