import seedrandom from "seedrandom";
import Weapon from "./Weapon";

/** Performs a single step in the weapon generation process */
export default abstract class WeaponFunction {
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
