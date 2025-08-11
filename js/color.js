// https://bottosson.github.io/posts/oklab/

var srgbToRgb = function(c) {
    var x = c / 255;
    if (x < 0.04045) {
        return x / 12.92;
    } else {
        return Math.pow((x + 0.055) / 1.055, 2.4);
    }
};

var rgbToSrgb = function(c) {
    var x;
    if (c < 0.04045 / 12.92) {
        x = c * 12.92;
    } else {
        x = Math.pow(c, 1 / 2.4) * 1.055 - 0.055;
    }
    x = Math.min(Math.max(0, x), 1);
    return x * 255;
};

export var rgbToLab = function(srgb) {
    var [r, g, b] = srgb.map(srgbToRgb);

    var l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    var m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    var s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    l = Math.cbrt(l);
    m = Math.cbrt(m);
    s = Math.cbrt(s);

    return [
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
    ];
};

export var labToRgb = function(lab) {
    var l = lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2];
    var m = lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2];
    var s = lab[0] - 0.0894841775 * lab[1] - 1.2914855480 * lab[2];

    l = l * l * l;
    m = m * m * m;
    s = s * s * s;

    var rgb = [
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];

    return rgb.map(rgbToSrgb);
};

export var hex = function(rgb) {
    return '#'
        + Math.floor(rgb[0] / 16).toString(16)
        + Math.floor(rgb[1] / 16).toString(16)
        + Math.floor(rgb[2] / 16).toString(16);
};

export var roundLab = function(lab) {
    var rgb = labToRgb(lab);
    rgb = rgb.map(c => Math.floor(c / 16) * 16);
    return rgbToLab(rgb);
};

export var distance = function(lab1, lab2) {
    var rounded1 = roundLab(lab1);
    var rounded2 = roundLab(lab2);
    return Math.sqrt(
        Math.pow(rounded1[0] - rounded2[0], 2)
        + Math.pow(rounded1[1] - rounded2[1], 2)
        + Math.pow(rounded1[2] - rounded2[2], 2)
    );
};
