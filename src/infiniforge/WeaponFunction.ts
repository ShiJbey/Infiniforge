import seedrandom from "seedrandom";
import { Weapon } from "./Weapon";

/** Performs a single step in the weapon generation process */
export abstract class WeaponFunction {
  public seed = 23;

  public abstract execute(weapon: Weapon): void;

  protected prng: seedrandom.PRNG = seedrandom();
  protected slots: Map<string, WeaponFunction> = new Map();

  /** Execute the function and modify the weapon data */
  protected executeSlots(weapon: Weapon): void {
    for (const [, slot] of this.slots) {
      slot.execute(weapon);
    }
  }

  public add_slot(name: string, fn: WeaponFunction): void {
    this.slots.set(name, fn);
  }
}

export type WeaponFactoryFn = (options: {
  [key: string]: unknown;
}) => WeaponFunction;

export class WeaponFunctionFactory {
  private static _registry: Map<string, WeaponFactoryFn> = new Map();

  public static register(name: string, factory: WeaponFactoryFn) {
    WeaponFunctionFactory._registry.set(name, factory);
  }

  public static instantiate(
    name: string,
    options: {
      [key: string]: unknown;
    }
  ): WeaponFunction {
    const factoryFn = WeaponFunctionFactory._registry.get(name);

    if (factoryFn === undefined) {
      throw new Error(`Weapon function factory not found for type, ${name}`);
    }

    return factoryFn(options);
  }
}
