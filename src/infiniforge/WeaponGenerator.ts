import { Weapon } from "./Weapon";
import { WeaponFunction } from "./WeaponFunction";

/**
 * Parameters passes to a weapon generator instance to
 * generate a new weapon model
 */
export interface WeaponGeneratorParams {
  /** A value used to seed the random number generator */
  seed: number | string;
}

/**
 * WeaponGenerators are the base object responsible for creating
 * weapon data. They use a tree of Generator functions to create
 * the various part of the blade
 */
export class WeaponGenerator {
  private _seed: string;
  private _rootFunction: WeaponFunction | null;
  private _verbose: boolean;

  constructor(
    seed: number | string = 23,
    rootFunction: WeaponFunction | null = null,
    verbose = false
  ) {
    this._seed = seed.toString();
    this._verbose = verbose;
    this._rootFunction = rootFunction;
  }

  set setVerbose(value: boolean) {
    this._verbose = value;
  }

  get getVerbose(): boolean {
    return this._verbose;
  }

  set setSeed(seed: string) {
    this._seed = seed;
  }

  get getSeed(): string {
    return this._seed;
  }

  generate(): Weapon {
    const data = new Weapon();

    if (this._rootFunction !== null) {
      this._rootFunction.execute(data);
    }

    return data;
  }
}
