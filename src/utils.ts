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



export { getRandomInt, getRandomFloat, getSlope };

