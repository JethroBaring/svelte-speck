import { Variable } from "./variable";

export class Environment {
  enclosing: Environment | null;
  values: Map<string, Variable> = new Map();
  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing;
  }

  get(name: string) {
    return this.values.get(name);
  }

  assign(name: string, value: any) {
    this.values.set(name, value);
  }
}
