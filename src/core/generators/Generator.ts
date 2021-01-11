import seedrandom from 'seedrandom';

/** Base class for all types of weapon generators */
export default abstract class Generator {

    protected _prng: seedrandom.prng;

    protected _verbose: boolean;

    constructor(verbose = false) {
        this._prng = seedrandom();
        this._verbose = verbose;
    }

    /** Set seed value for random number generator */
    setSeed(seed: string): void {
        this._prng = seedrandom(seed);
    }

    /** Allow verbose output during generation */
    setVerbose(verbose: boolean): void {
        this._verbose = verbose;
    }

    /** Generate new GeometryData */
    abstract generate(params: any): Promise<any>;
}
