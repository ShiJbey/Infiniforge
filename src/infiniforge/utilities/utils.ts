import seedrandom from "seedrandom";
import * as THREE from "three";

/** Number generator Function */
type NumGeneratorFn = seedrandom.PRNG | (() => number);

/** Return a random int that is in the range [min,max) */
export function getRandomInt(
  prng: NumGeneratorFn,
  min: number,
  max: number
): number {
  return (
    Math.floor(prng() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min)
  );
}

/** Return a random float that is in the range [min,max) */
export function getRandomFloat(
  prng: NumGeneratorFn,
  min: number,
  max: number
): number {
  return prng() * (max - min) + min;
}

/** Return the slope between the two points */
export function getSlope(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return (y2 - y1) / (x2 - x1);
}

/** Set the number of digits after the decimal place */
export function setPrecision(value: number, digits: number): number {
  return Number.parseFloat(value.toFixed(digits));
}

/** Subdivide a number value into a given number of divisions */
export function divideValue(
  value: number,
  nDivisions: number,
  equalDivs: boolean,
  prng?: NumGeneratorFn
): number[] {
  const divisions: number[] = [];
  const prngFn = !equalDivs && prng ? prng : Math.random;
  const equalDivSize = value / nDivisions;

  if (equalDivs) {
    for (let i = 0; i < nDivisions; i++) {
      divisions.push(equalDivSize);
    }
  } else {
    let remainder = value;
    for (let i = 0; i < nDivisions; i++) {
      if (i === nDivisions - 1) {
        divisions.push(remainder);
      } else {
        const minDivSize = equalDivSize * 0.25;
        const maxDivSize = equalDivSize * 1.25;
        const randSize = getRandomFloat(prngFn, minDivSize, maxDivSize);
        const sizeCap = remainder - minDivSize * (nDivisions - i);
        const divSize = Math.min(randSize, sizeCap);

        divisions.push(divSize);
        remainder -= divSize;
      }
    }
  }

  return divisions;
}

/** Normalize magnitude of color vector to be 1 */
export function normalizeRGB(rgbColor: number[]): [number, number, number] {
  if (rgbColor.length < 3) {
    throw Error("Invalid RBG color Given. Too few values");
  }

  const red = rgbColor[0] > 1.0 ? rgbColor[0] / 255.0 : rgbColor[0];
  const green = rgbColor[1] > 1.0 ? rgbColor[1] / 255.0 : rgbColor[1];
  const blue = rgbColor[2] > 1.0 ? rgbColor[2] / 255.0 : rgbColor[2];

  return [red, green, blue];
}

/** Convert Hex color to RGB values  */
export function hexToRGB(hexColor: number): [number, number, number] {
  const RED_MASK = 0xff0000;
  const GREEN_MASK = 0x00ff00;
  const BLUE_MASK = 0x0000ff;

  const red = (hexColor & RED_MASK) >> 16;
  const green = (hexColor & GREEN_MASK) >> 8;
  const blue = hexColor & BLUE_MASK;

  return [red / 255.0, green / 255.0, blue / 255.0];
}

/**
 * Creates a SplineCurve for edge geometry
 *
 * @param nPoints Number of points in the curve not including ends
 */
export function createEdgeSpline(
  prng: seedrandom.PRNG,
  nPoints: number,
  widthTolerance: number,
  evenSpacing = true
): THREE.SplineCurve {
  if (nPoints < 0) {
    throw new Error("Invalid number of points to create spline curve");
  }

  // Spline points are defined on the interval [0,1]
  // and are defined along the positive y-axis.
  // The  x-values of the points along the curve represent
  // the width of the blade's edge when measured from
  // the center of the cross-section

  const splinePoints: THREE.Vector2[] = [new THREE.Vector2(0, 0)];

  // Spacings are the vertical distance between control points on the spline curve
  const spacing = divideValue(1.0, nPoints + 1, evenSpacing, prng);

  let totalSpacing = 0;

  for (let i = 0; i < spacing.length; i++) {
    // Space the point vertically
    const point = new THREE.Vector2();
    if (i === spacing.length - 1) {
      point.y = 1.0;
      point.x = 0.0;
    } else {
      totalSpacing += spacing[i];
      point.y = totalSpacing;
      point.x = getRandomFloat(prng, -widthTolerance, widthTolerance);
    }
    splinePoints.push(point);
  }

  return new THREE.SplineCurve(splinePoints);
}
