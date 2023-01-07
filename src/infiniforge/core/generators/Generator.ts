import seedrandom from "seedrandom";

/** Base class for all types of weapon generators */
export default abstract class Generator {
  protected prng: seedrandom.PRNG;

  protected verbose: boolean;

  constructor(verbose = false) {
    this.prng = seedrandom();
    this.verbose = verbose;
  }

  /** Set seed value for random number generator */
  setSeed(seed: string): void {
    this.prng = seedrandom(seed);
  }

  /** Allow verbose output during generation */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  /** Generate new GeometryData */
  abstract generate(params: Record<string, any>): Promise<any>;
}
