import { Expr } from "./expr";
import { Parameter } from "./parameter";
import { Token } from "./token";
import { TokenType } from "./token-type";

export interface StmtVisitor<R> {
  visitBlockStmt(stmt: BlockStmt): R;
  visitExpressionStmt(stmt: ExpressionStmt): R;
  visitFunctionStmt(stmt: FunctionStmt): R;
  visitIfStmt(stmt: IfStmt): R;
  visitPrintStmt(stmt: PrintStmt): R;
  visitWhileStmt(stmt: WhileStmt): R;
  visitGoStmt(stmt: GoStmt): R | Promise<R>;
  visitWaitStmt(stmt: WaitStmt): R | Promise<R>;
  visitTypeStmt(stmt: TypeStmt): R | Promise<R>;
  visitPressStmt(stmt: PressStmt): R | Promise<R>;
  visitExpectStmt(stmt: ExpectStmt): R | Promise<R>;
  visitClickStmt(stmt: ClickStmt): R | Promise<R>;
  visitSelectStmt(stmt: SelectStmt): R | Promise<R>;
  visitGetStmt(stmt: GetStmt): R | Promise<R>;
  visitRefreshStmt(stmt: RefreshStmt): R | Promise<R>;
  visitSetStmt(stmt: SetStmt): R;
  visitCheckboxStmt(stmt: CheckboxStmt): R | Promise<R>;
  visitHoverStmt(stmt: HoverStmt): R | Promise<R>;
  visitForEachStmt(stmt: ForEachStmt): R | Promise<R>;
  visitRepeatStmt(stmt: RepeatStmt): R | Promise<R>;
  visitCallStmt(stmt: CallStmt): R | Promise<R>;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R | Promise<R>;
}

export class BlockStmt extends Stmt {
  constructor(public statements: Stmt[]) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitBlockStmt(this);
  }
}

export class ExpressionStmt extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitExpressionStmt(this);
  }
}

export class FunctionStmt extends Stmt {
  constructor(
    public name: Token,
    public params: Parameter[],
    public body: Stmt[],
    public returnType: Token
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitFunctionStmt(this);
  }
}

export class IfStmt extends Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt[],
    public elseIfConditions: Expr[],
    public elseIfBranches: Stmt[][],
    public elseBranch: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitIfStmt(this);
  }
}

export class PrintStmt extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitPrintStmt(this);
  }
}

export class WhileStmt extends Stmt {
  constructor(public condition: Expr, public body: Stmt[]) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitWhileStmt(this);
  }
}

export class GoStmt extends Stmt {
  constructor(public action: "to" | "back" | "forward", public target?: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitGoStmt(this);
  }
}

export class ClickStmt extends Stmt {
  constructor(
    public selector: Expr,
    public modifier: "nth" | "last" | "all",
    public value?: number
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitClickStmt(this);
  }
}

export class TypeStmt extends Stmt {
  constructor(public value: Expr, public selector: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitTypeStmt(this);
  }
}

export class ExpectStmt extends Stmt {
  constructor(
    public type: "element" | "page title" | "url" | "variable",
    public target: Expr | null,
    public conditionType: "to be" | "to contain" | "to have text",
    public expectedValue:
      | Expr
      | "visible"
      | "hidden"
      | "enabled"
      | "disabled"
      | "checked"
      | "unchecked"
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitExpectStmt(this);
  }
}

export class GetStmt extends Stmt {
  constructor(public url: Token) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitGetStmt(this);
  }
}

export class WaitStmt extends Stmt {
  constructor(
    public type: "time" | "element" | "page",
    public value?: Expr,
    public condition?: "appear" | "disappear"
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitWaitStmt(this);
  }
}

export class PressStmt extends Stmt {
  constructor(public key: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitPressStmt(this);
  }
}

export class SelectStmt extends Stmt {
  constructor(public value: Expr, public selector: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitSelectStmt(this);
  }
}

export class RefreshStmt extends Stmt {
  constructor() {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitRefreshStmt(this);
  }
}

export class SetStmt extends Stmt {
  constructor(public target: string, public value: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitSetStmt(this);
  }
}

export class CheckboxStmt extends Stmt {
  constructor(public action: "check" | "uncheck", public selector: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitCheckboxStmt(this);
  }
}

export class HoverStmt extends Stmt  {
  constructor(public selector: Expr) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitHoverStmt(this);
  }
}

export class ForEachStmt extends Stmt {
  constructor(
    public variable: string,
    public collection: Expr,
    public body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitForEachStmt(this);
  }
}

export class RepeatStmt extends Stmt {
  constructor(
    public count: Expr | number,
    public body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitRepeatStmt(this);
  }
}

export class CallStmt extends Stmt {
  constructor(
    public functionName: string,
    public args: Expr[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R | Promise<R> {
    return visitor.visitCallStmt(this);
  }
}