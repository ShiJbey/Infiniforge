export abstract class AbstractAttribute {
  public abstract addData(): void;
}

export class Attribute<T> extends AbstractAttribute {
  public name: string;
  public data: T[];
  private _defaultValue: T;

  constructor(name: string, defaultValue: T) {
    super();
    this.name = name;
    this.data = [];
    this._defaultValue = defaultValue;
  }

  public addData(): void {
    this.data.push(this._defaultValue);
  }
}
