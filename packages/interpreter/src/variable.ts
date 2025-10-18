import { TokenType } from "./token-type";

export class Variable {
  private type: TokenType;
  private value: any;

  constructor(type: TokenType, value: any) {
    this.type = type;
    this.value = value;
  }

  getType(): TokenType {
    return this.type;
  }

  setType(type: TokenType): void {
    this.type = type;
  }

  getValue(): any {
    return this.value;
  }

  setValue(value: any): void {
    this.value = value;
  }

  toString(): string {
    return String(this.value);
  }
}
