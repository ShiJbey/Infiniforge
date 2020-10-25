/// <reference types="seedrandom" />
declare type NumGenerator = seedrandom.prng | (() => number);
export declare function getRandomInt(prng: NumGenerator, min: number, max: number): number;
export declare function getRandomFloat(prng: NumGenerator, min: number, max: number): number;
export declare function getSlope(x1: number, y1: number, x2: number, y2: number): number;
export declare function setPrecision(value: number, digits: number): number;
export declare function divideValue(value: number, nDivisions: number, equalDivs: boolean, prng?: NumGenerator): number[];
export declare function parseHexColorString(color: string): number;
export declare function normalizeRGB(rgbColor: number[]): [number, number, number];
export declare function HextoRGB(hexColor: number): [number, number, number];
export {};
