"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HextoRGB = exports.normalizeRGB = exports.parseHexColorString = exports.setPrecision = exports.getSlope = exports.getRandomFloat = exports.getRandomInt = void 0;
function getRandomInt(prng, min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(prng() * (max - min)) + min;
}
exports.getRandomInt = getRandomInt;
function getRandomFloat(prng, min, max) {
    return prng() * (max - min) + min;
}
exports.getRandomFloat = getRandomFloat;
function getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}
exports.getSlope = getSlope;
function setPrecision(value, digits) {
    return Number.parseFloat(value.toFixed(digits));
}
exports.setPrecision = setPrecision;
function parseHexColorString(color) {
    color = color.trim();
    if (isNaN(Number(color)) && color[0] == "#") {
        color = "0x" + color.substring(1);
        if (isNaN(Number(color))) {
            throw Error("Invalid color string given.");
        }
    }
    var colorHex = Number.parseInt(color, 16);
    return colorHex;
}
exports.parseHexColorString = parseHexColorString;
function normalizeRGB(rgbColor) {
    if (rgbColor.length < 3) {
        throw Error("Invalid RBG color Given. Too few values");
    }
    rgbColor[0] = (rgbColor[0] > 1.0) ? rgbColor[0] / 255.0 : rgbColor[0];
    rgbColor[1] = (rgbColor[1] > 1.0) ? rgbColor[1] / 255.0 : rgbColor[1];
    rgbColor[2] = (rgbColor[2] > 1.0) ? rgbColor[2] / 255.0 : rgbColor[2];
    return [rgbColor[0], rgbColor[1], rgbColor[2]];
}
exports.normalizeRGB = normalizeRGB;
function HextoRGB(hexColor) {
    const RED_MASK = 0xFF0000;
    const GREEN_MASK = 0x00FF00;
    const BLUE_MASK = 0x0000FF;
    var red = (hexColor & RED_MASK) >> 16;
    var green = (hexColor & GREEN_MASK) >> 8;
    var blue = hexColor & BLUE_MASK;
    return [red / 255.0, green / 255.0, blue / 255.0];
}
exports.HextoRGB = HextoRGB;
//# sourceMappingURL=utils.js.map