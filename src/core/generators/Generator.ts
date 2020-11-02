import * as seedrandom from 'seedrandom';

/** Base class for all types of weapon generators */
export class Generator {

    protected _prng: seedrandom.prng;
    protected _verbose: boolean;

    constructor(verbose = false) {
        this._prng = seedrandom();
        this._verbose = verbose;
    }

    setSeed(seed: string) {
        this._prng = seedrandom(seed);
    }

    setVerbose(verbose: boolean) {
        this._verbose = verbose;
    }

    generate(options: any) {
        return new Promise((resolve, reject) => {
            reject("Generate function is not implemented");
        });
    }
}

export default { Generator }
