import { rgbToLab, labToRgb, hex } from './color.js';

var file2img = function(file) {
    // FIXME: uses unsafe inline image
    return new Promise((resolve, reject) => {
        var img = new Image();
        var url = URL.createObjectURL(file);

        img.onerror = err => {
            URL.revokeObjectURL(url);
            reject(err);
        };
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.src = url;
    });
};

var img2data = function(img, width) {
    var _canvas = document.createElement('canvas');
    _canvas.width = width;
    _canvas.height = Math.round(img.height / img.width * width);
    var _ctx = _canvas.getContext('2d');
    _ctx.drawImage(img, 0, 0, _canvas.width, _canvas.height);
    return _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
};


class Cluster {
    constructor(center) {
        this.center = center;
        this.count = 1;
    }

    distance(color) {
        return Math.sqrt(
            Math.pow(this.center[0] - color[0], 2)
            + Math.pow(this.center[1] - color[1], 2)
            + Math.pow(this.center[2] - color[2], 2)
        );
    }

    add(color) {
        this.center = [
            (this.center[0] * this.count + color[0]) / (this.count + 1),
            (this.center[1] * this.count + color[1]) / (this.count + 1),
            (this.center[2] * this.count + color[2]) / (this.count + 1),
        ];
        this.count += 1;
    }
}

var analyze = function(img) {
    var j;
    var clusters = [];
    var out = [];
    for (var i = 0; i < img.data.length; i += 4) {
        var lab = rgbToLab([
            img.data[i],
            img.data[i + 1],
            img.data[i + 2],
        ]);

        for (j = 0; j < clusters.length; j++) {
            if (clusters[j].distance(lab) < 0.08) {
                clusters[j].add(lab);
                out.push(j + 1);
                break;
            }
        }
        if (j === clusters.length) {
            clusters.push(new Cluster(lab));
            out.push(j + 1);
        }
    }

    var colors = ['white'];
    var contrasts = ['black'];
    for (j = 0; j < clusters.length; j++) {
        colors.push(hex(labToRgb(clusters[j].center)));
        contrasts.push(clusters[j].center[0] < 0.5 ? 'white' : 'black');
    }

    return {
        width: img.width,
        height: img.height,
        colors: colors,
        contrasts: contrasts,
        data: out,
    };
};

export var loadImage = function(input, width) {
    return file2img(input.files[0]).then(img => {
        return analyze(img2data(img, width));
    });
};
