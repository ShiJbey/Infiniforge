/////////////////////////////////////////////////////////////////
//                      RANDOM NUMBERS                         //
/////////////////////////////////////////////////////////////////

/**
 * Given a random number generator and a min and max value,
 * returns a random int that is in the range [min,max)
 *
 * @param prng
 * @param min
 * @param max
 */
function getRandomInt(prng : seedrandom.prng, min : number, max : number) : number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return  Math.floor(prng() * (max - min)) + min;
}

/**
 * Given a random number generator and a min and max value,
 * returns a random float that is in the range [min,max)
 *
 * @param prng seedrandom pseudo-random number generator
 * @param min
 * @param max
 */
function getRandomFloat(prng : seedrandom.prng, min : number, max : number) : number {
    return prng() * (max - min) + min;
}

/////////////////////////////////////////////////////////////////
//                    ALGEBRA FUNCTIONS                        //
/////////////////////////////////////////////////////////////////

/**
 * Given the x and y coordinates of two points in 2D space,
 * Returns the slope between the two points
 *
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
function getSlope(x1 : number,  y1 : number, x2 : number, y2 : number) : number {
    return (y2 - y1) / (x2 - x1);
}

/////////////////////////////////////////////////////////////////
//                       MISC FUNCTIONS                        //
/////////////////////////////////////////////////////////////////

/**
 * Sets the number of digits after the decimal place
 * @param n
 * @param digits
 */
function setPrecision(value: number, digits: number) {
    return Number.parseFloat(value.toFixed(digits));
}

/////////////////////////////////////////////////////////////////
//                   HEX STRING FUNCTIONS                      //
/////////////////////////////////////////////////////////////////

function parseHexColorString(color: string): number {
    // Remove beginning and trailing white space
    color = color.trim();
    // Check if the value is a number
    if (isNaN(Number(color)) && color[0] == "#") {
        color = "0x" + color.substring(1);
        if (isNaN(Number(color))) {
            throw Error("Invalid color string given.");
        }
    }
    var colorHex = Number.parseInt(color, 16);
    return colorHex;
}

function toRGB(hexColor: number) : [number, number, number] {
    const RED_MASK = 0xFF0000;
    const GREEN_MASK = 0x00FF00;
    const BLUE_MASK = 0x0000FF;

    var red = (hexColor & RED_MASK) >> 16;
    var green = (hexColor & GREEN_MASK) >> 8;
    var blue = hexColor & BLUE_MASK;

    return [ red / 255.0 , green / 255.0 , blue / 255.0 ];
}

export { getRandomInt, getRandomFloat, getSlope, setPrecision, parseHexColorString, toRGB };

