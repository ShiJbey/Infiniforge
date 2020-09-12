/// <reference types="seedrandom" />
export declare function getRandomInt(prng: seedrandom.prng, min: number, max: number): number;
export declare function getRandomFloat(prng: seedrandom.prng, min: number, max: number): number;
export declare function getSlope(x1: number, y1: number, x2: number, y2: number): number;
export declare function setPrecision(value: number, digits: number): number;
export declare function parseHexColorString(color: string): number;
export declare function normalizeRGB(rgbColor: number[]): [number, number, number];
export declare function HextoRGB(hexColor: number): [number, number, number];
