import * as seedrandom from 'seedrandom';
export declare class Generator {
    protected _prng: seedrandom.prng;
    protected _verbose: boolean;
    constructor(verbose?: boolean);
    setSeed(seed: string): void;
    generate(options: any): Promise<unknown>;
}
declare const _default: {
    Generator: typeof Generator;
};
export default _default;
