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

var round = function(c) {
    return Math.floor(c / 51) * 3;
};

var makecolor = function(a) {
    return '#'
        + round(a[0]).toString(16)
        + round(a[1]).toString(16)
        + round(a[2]).toString(16);
};

var sRGB = function(c) {
    var x = round(c) / 15;
    if (x < 0.04045) {
        return x / 12.92;
    } else {
        return Math.pow((x + 0.055) / 1.055, 2.4);
    }
};

var makeContrast = function(a) {
    var l = 0.2126 * sRGB(a[0]) + 0.7152 * sRGB(a[1]) + 0.0722 * sRGB(a[2]);
    return l > 0.18 ? '#000' : '#fff';
};

var analyze = function(img) {
    var c, i, j;
    var colors = ['white'];
    var contrasts = ['black'];
    var out = [];
    for (i = 0; i < img.data.length; i += 4) {
        c = makecolor(img.data.slice(i, i + 3));
        j = colors.indexOf(c);
        if (j === -1) {
            j = colors.length;
            colors.push(c);
            contrasts.push(makeContrast(img.data.slice(i, i + 3)));
        }
        out.push(j);
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
