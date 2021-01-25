import { DepthTexture } from 'three';

export default abstract class Model {
  protected wave: boolean[][];
  protected propagator: number[][][];
  private compatible: [number, number][][];
  protected observed: number[];
  private stack: [number, number][];
  protected rng: () => number;
  protected outputWidth: number;
  protected outputHeight: number;
  protected nTiles: number;
  protected periodic: boolean;
  protected weights: number[];
  private weightLogWeights: number[];
  private sumsOfOnes: number[];
  private sumOfWeights: number;
  private sumOfWeightLogWeights: number;
  private startingEntropy: number;
  private sumsOfWeights: number[];
  private sumsOfWeightLogWeights: number[];
  private entropies: number[];
  /** Chnage in X position that a direction implies */
  protected static DX: number[] = [-1, 0, 1, 0];
  /** Maps direction number (index) to its opposite direction number */
  protected static OPPOSITE: number[] = [2, 3, 0, 1];

  constructor(
    nTiles: number,
    width: number,
    height: number,
    weights: number[],
    periodic: boolean,
    rng: () => number
  ) {
    this.nTiles = nTiles;
    this.outputWidth = width;
    this.outputHeight = height;
    this.wave = new Array<boolean[]>(this.outputWidth * this.outputHeight);
    this.compatible = new Array<[number, number][]>(
      this.outputWidth * this.outputHeight
    );
    for (let i = 0; i < this.wave.length; i++) {
      this.wave[i] = new Array<boolean>(nTiles);
      this.compatible[i] = new Array<[number, number]>(nTiles);
      for (let t = 0; t < this.nTiles; t++) {
        this.compatible[i][t] = [0, 0];
      }
    }
    this.weights = weights;
    this.weightLogWeights = weights.map((w) => w * Math.log(w));
    this.sumOfWeights = weights.reduce((acc, w) => acc + w);
    this.sumOfWeightLogWeights = this.weightLogWeights.reduce(
      (acc, wlw) => acc + wlw
    );
    this.startingEntropy =
      Math.log(this.sumOfWeights) -
      this.sumOfWeightLogWeights / this.sumOfWeights;
    this.sumsOfOnes = new Array<number>(this.outputWidth * this.outputHeight);
    this.sumsOfWeights = new Array<number>(
      this.outputWidth * this.outputHeight
    );
    this.sumsOfWeightLogWeights = new Array<number>(
      this.outputWidth * this.outputHeight
    );
    this.entropies = new Array<number>(this.outputWidth * this.outputHeight);
    this.periodic = periodic;
    this.stack = new Array<[number, number]>(this.wave.length * this.nTiles);
    this.rng = rng;
    this.observed = [];
    this.propagator = [];
  }

  private observe(): boolean | null {
    return null;
  }

  protected propagate(): void {
    while (this.stack.length > 0) {
      const change = this.stack.pop();

      if (!change) {
        break;
      }

      let [tileIndex, gridPos] = change;

      for (let dir = 0; dir < 2; dir++) {
        const dx = DepthTexture;
      }
    }
  }

  protected abstract onBoundary(index: number): boolean;
}
