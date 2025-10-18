import { Environment } from "./environment";
import {
  Assign,
  Binary,
  Call,
  Expr,
  ExprVisitor,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from "./expr";
import {
  BlockStmt,
  CheckboxStmt,
  ClickStmt,
  ExpectStmt,
  ExpressionStmt,
  FunctionStmt,
  GetStmt,
  GoStmt,
  HoverStmt,
  IfStmt,
  PressStmt,
  PrintStmt,
  RefreshStmt,
  SelectStmt,
  SetStmt,
  Stmt,
  StmtVisitor,
  TypeStmt,
  WaitStmt,
  WhileStmt,
  ForEachStmt,
  RepeatStmt,
  CallStmt,
} from "./stmt";
import { TokenType } from "./token-type";
import { Page } from "playwright";

class FunctionCallable {
  constructor(
    public declaration: FunctionStmt,
    private closure: Environment
  ) {}

  async call(interpreter: Interpreter, args: any[]): Promise<any> {
    const environment = new Environment(this.closure);
    
    // Bind parameters to argument values
    for (let i = 0; i < this.declaration.params.length; i++) {
      const param = this.declaration.params[i];
      const argValue = i < args.length ? args[i] : undefined;
      
      if (argValue !== undefined) {
        environment.assign(param.name.lexeme, argValue);
      } else {
        interpreter.addError(`Missing argument for parameter '${param.name.lexeme}' in function call`);
      }
    }
    
    // Check for too many arguments
    if (args.length > this.declaration.params.length) {
      interpreter.addError(`Too many arguments provided: expected ${this.declaration.params.length}, got ${args.length} in function call`);
    }

    const previous = interpreter.environment;
    interpreter.environment = environment;

    try {
      for (const statement of this.declaration.body) {
        await interpreter.execute(statement);
      }
    } finally {
      interpreter.environment = previous;
    }

    return null;
  }
}

export class Interpreter implements ExprVisitor<any>, StmtVisitor<any> {
  private errors: string[] = [];

  constructor(
    public environment = new Environment(),
    public mode: "execute" | "validate" = "execute",
    public page: Page | null = null
  ) {}

  async interpret(statements: Stmt[]): Promise<string[] | void> {
    this.errors = []; // Reset errors for each interpretation
    
    try {
      for (const statement of statements) {
        await this.execute(statement);
      }
    } catch (error) {
      this.addError(`Runtime error: ${(error as Error).message}`);
    }

    if (this.mode === "validate") {
      return this.errors;
    }
  }

  addError(message: string) {
    this.errors.push(message);
  }

  private formatError(message: string, context?: string): string {
    const prefix = this.mode === "validate" ? "Validation Error" : "Runtime Error";
    const contextInfo = context ? ` (${context})` : "";
    return `${prefix}: ${message}${contextInfo}`;
  }

  getErrors(): string[] {
    return this.errors;
  }

  // Static method to create a validation-only interpreter
  static createValidator(): Interpreter {
    return new Interpreter(new Environment(), "validate", null);
  }

  // Method to validate statements and return errors
  static async validate(statements: Stmt[]): Promise<string[]> {
    const validator = Interpreter.createValidator();
    await validator.interpret(statements);
    return validator.getErrors();
  }

  async visitGoStmt(stmt: GoStmt) {
    if (this.mode === "execute") {
      let action = stmt.action;
      let target = stmt.target;
      if (action === "to") {
        await this.page?.goto(this.evaluate(target as Expr) ?? "");
      } else if (action === "back") {
        await this.page?.goBack();
      } else if (action === "forward") {
        await this.page?.goForward();
      }
    } else {
      // Validate mode - check for errors
      if (stmt.action === "to" && !stmt.target) {
        this.addError("Go statement with 'to' action requires a target URL to navigate to");
      }
      if (stmt.target) {
        try {
          this.evaluate(stmt.target as Expr);
        } catch (error) {
          this.addError(`Invalid URL expression in go statement: ${(error as Error).message}`);
        }
      }
    }
    return null;
  }

  visitWaitStmt(stmt: WaitStmt) {
    if (this.mode === "execute") {
      this.page?.waitForTimeout(this.evaluate(stmt.value as Expr) ?? 1000);
    } else {
      // Validate mode - check for errors
      if (stmt.type === "time" && !stmt.value) {
        this.addError("Wait statement with 'time' type requires a numeric value for duration");
      }
      if (stmt.value) {
        try {
          const value = this.evaluate(stmt.value as Expr);
          if (stmt.type === "time" && (typeof value !== "number" || value < 0)) {
            this.addError("Wait time must be a positive number (seconds)");
          }
        } catch (error) {
          this.addError(`Invalid wait value expression: ${(error as Error).message}`);
        }
      }
    }
    return null;
  }

  visitTypeStmt(stmt: TypeStmt) {
    if (this.mode === "execute") {
      this.page?.fill(this.evaluate(stmt.selector as Expr) ?? "", this.evaluate(stmt.value as Expr) ?? "");
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.selector as Expr);
      } catch (error) {
        this.addError(`Invalid selector expression in type statement: ${(error as Error).message}`);
      }
      try {
        this.evaluate(stmt.value as Expr);
      } catch (error) {
        this.addError(`Invalid value expression in type statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  visitPressStmt(stmt: PressStmt) {
    if (this.mode === "execute") {
      this.page?.keyboard.down(this.evaluate(stmt.key as Expr) ?? "");
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.key as Expr);
      } catch (error) {
        this.addError(`Invalid key expression in press statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  visitExpectStmt(stmt: ExpectStmt) {
    if (this.mode === "execute") {
      const target = stmt.target ? this.evaluate(stmt.target) as string : null;
      const expectedValue = typeof stmt.expectedValue === "string" 
        ? stmt.expectedValue 
        : this.evaluate(stmt.expectedValue as Expr);

      switch (stmt.type) {
        case "page title":
          return this.page?.title();
        case "url":
          return this.page?.url();
        case "element":
          if (!target) throw new Error("Element selector required for element expectations");
          return this.page?.locator(target);
        case "variable":
          return this.environment.get(target || "");
        default:
          throw new Error(`Unknown expectation type: ${stmt.type}`);
      }
    } else {
      // Validate mode - check for errors
      if (stmt.type === "element" && !stmt.target) {
        this.addError("Element expectation requires a CSS selector to target the element");
      }
      if (stmt.target) {
        try {
          this.evaluate(stmt.target as Expr);
        } catch (error) {
          this.addError(`Invalid target expression in expect statement: ${(error as Error).message}`);
        }
      }
      if (typeof stmt.expectedValue !== "string") {
        try {
          this.evaluate(stmt.expectedValue as Expr);
        } catch (error) {
          this.addError(`Invalid expected value expression in expect statement: ${(error as Error).message}`);
        }
      }
    }
    return null;
  }

  async visitClickStmt(stmt: ClickStmt) {
    if (this.mode === "execute") {
      const selector = this.evaluate(stmt.selector) as string;
      
      if (stmt.modifier === "all") {
        const elements = await this.page?.locator(selector).all();
        if (elements) {
          for (const element of elements) {
            await element.click();
          }
        }
      } else if (stmt.modifier === "nth" && stmt.value !== undefined) {
        await this.page?.locator(selector).nth(stmt.value).click();
      } else if (stmt.modifier === "last") {
        await this.page?.locator(selector).last().click();
      } else {
        await this.page?.click(selector);
      }
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.selector as Expr);
      } catch (error) {
        this.addError(`Invalid selector expression in click statement: ${(error as Error).message}`);
      }
      if (stmt.modifier === "nth" && (stmt.value === undefined || stmt.value < 0)) {
        this.addError("Click statement with 'nth' modifier requires a valid positive index (starting from 1)");
      }
    }
    return null;
  }

  async visitSelectStmt(stmt: SelectStmt) {
    if (this.mode === "execute") {
      const value = this.evaluate(stmt.value) as string;
      const selector = this.evaluate(stmt.selector) as string;
      await this.page?.selectOption(selector, value);
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.value as Expr);
      } catch (error) {
        this.addError(`Invalid value expression in select statement: ${(error as Error).message}`);
      }
      try {
        this.evaluate(stmt.selector as Expr);
      } catch (error) {
        this.addError(`Invalid selector expression in select statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  async visitGetStmt(stmt: GetStmt) {
    if (this.mode === "execute") {
      await this.page?.goto(stmt.url.lexeme);
    } else {
      // Validate mode - check for errors
      if (!stmt.url.lexeme || stmt.url.lexeme.trim() === "") {
        this.addError("Get statement requires a valid URL to navigate to");
      } else {
        try {
          new URL(stmt.url.lexeme);
        } catch (error) {
          this.addError(`Invalid URL in get statement: ${stmt.url.lexeme}`);
        }
      }
    }
    return null;
  }

  async visitRefreshStmt(stmt: RefreshStmt) {
    if (this.mode === "execute") {
      await this.page?.reload();
    } else {
      // Validate mode - no specific validation needed for refresh
    }
    return null;
  }

  visitSetStmt(stmt: SetStmt) {
    if (this.mode === "execute") {
      const value = this.evaluate(stmt.value);
      this.environment.assign(stmt.target, value);
      return value;
    } else {
      // Validate mode - check for errors
      if (!stmt.target || stmt.target.trim() === "") {
        this.addError("Set statement requires a valid variable name to assign value to");
      }
      try {
        this.evaluate(stmt.value as Expr);
      } catch (error) {
        this.addError(`Invalid value expression in set statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  async visitCheckboxStmt(stmt: CheckboxStmt) {
    if (this.mode === "execute") {
      const selector = this.evaluate(stmt.selector) as string;
      if (stmt.action === "check") {
        await this.page?.check(selector);
      } else {
        await this.page?.uncheck(selector);
      }
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.selector as Expr);
      } catch (error) {
        this.addError(`Invalid selector expression in checkbox statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  async visitHoverStmt(stmt: HoverStmt) {
    if (this.mode === "execute") {
      const selector = this.evaluate(stmt.selector) as string;
      await this.page?.hover(selector);
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.selector as Expr);
      } catch (error) {
        this.addError(`Invalid selector expression in hover statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  async visitForEachStmt(stmt: ForEachStmt) {
    if (this.mode === "execute") {
      const collection = this.evaluate(stmt.collection);
      if (Array.isArray(collection)) {
        for (const item of collection) {
          this.environment.assign(stmt.variable, item);
          for (const statement of stmt.body) {
            await this.execute(statement);
          }
        }
      } else {
        this.addError(`For each loop requires an array collection, got ${typeof collection}`);
      }
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.collection as Expr);
      } catch (error) {
        this.addError(`Invalid collection expression in for each statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  async visitRepeatStmt(stmt: RepeatStmt) {
    if (this.mode === "execute") {
      const count = typeof stmt.count === "number" ? stmt.count : this.evaluate(stmt.count as Expr);
      if (typeof count !== "number" || count < 0) {
        this.addError(`Repeat count must be a positive number, got ${count} (must be >= 1)`);
        return null;
      }
      
      for (let i = 0; i < count; i++) {
        for (const statement of stmt.body) {
          await this.execute(statement);
        }
      }
    } else {
      // Validate mode - check for errors
      if (typeof stmt.count !== "number") {
        try {
          this.evaluate(stmt.count as Expr);
        } catch (error) {
          this.addError(`Invalid count expression in repeat statement: ${(error as Error).message}`);
        }
      }
    }
    return null;
  }

  async visitCallStmt(stmt: CallStmt) {
    if (this.mode === "execute") {
      const args: any[] = [];
      for (const arg of stmt.args) {
        args.push(this.evaluate(arg));
      }
      
      const func = this.environment.get(stmt.functionName);
      if (func instanceof FunctionCallable) {
        return await func.call(this, args);
      } else {
        this.addError(`Function '${stmt.functionName}' is not defined`);
      }
    } else {
      // Validate mode - check for errors
      const func = this.environment.get(stmt.functionName);
      if (!func) {
        this.addError(`Function '${stmt.functionName}' is not defined (use 'define' to create functions)`);
      } else if (func instanceof FunctionCallable) {
        // Check parameter count
        const expectedParams = func.declaration.params.length;
        const providedArgs = stmt.args.length;
        
        if (providedArgs < expectedParams) {
          this.addError(`Function '${stmt.functionName}' expects ${expectedParams} parameter(s), got ${providedArgs} (missing ${expectedParams - providedArgs})`);
        } else if (providedArgs > expectedParams) {
          this.addError(`Function '${stmt.functionName}' expects ${expectedParams} parameter(s), got ${providedArgs} (too many by ${providedArgs - expectedParams})`);
        }
      }
      
      for (const arg of stmt.args) {
        try {
          this.evaluate(arg);
        } catch (error) {
          this.addError(`Invalid argument expression in function call: ${(error as Error).message}`);
        }
      }
    }
    return null;
  }

  visitAssignExpr(expr: Assign) {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name.lexeme, value);
    return value;
  }

  async visitCallExpr(expr: Call) {
    if (this.mode === "execute") {
      const callee = this.evaluate(expr.callee);
      const args: any[] = [];
      
      for (const arg of expr.args) {
        args.push(this.evaluate(arg));
      }

      if (callee instanceof FunctionCallable) {
        return await callee.call(this, args);
      }

      throw new Error("Can only call functions.");
    } else {
      // Validate mode - check for errors
      try {
        const callee = this.evaluate(expr.callee);
        if (!(callee instanceof FunctionCallable)) {
          this.addError(`Cannot call non-function: ${expr.callee}`);
        }
      } catch (error) {
        this.addError(`Invalid function expression in call: ${(error as Error).message}`);
      }
      
      for (const arg of expr.args) {
        try {
          this.evaluate(arg);
        } catch (error) {
          this.addError(`Invalid argument expression in function call: ${(error as Error).message}`);
        }
      }
    }
    return null;
  }

  visitVariableExpr(expr: Variable) {
    if (this.mode === "execute") {
      return this.environment.get(expr.name.lexeme);
    } else {
      // Validate mode - check if variable exists
      const value = this.environment.get(expr.name.lexeme);
      if (value === undefined) {
        this.addError(`Undefined variable '${expr.name.lexeme}' (use 'set' to create variables)`);
      }
      return value;
    }
  }

  async visitBlockStmt(stmt: BlockStmt) {
    const previous = this.environment;
    this.environment = new Environment(previous);

    try {
      for (const statement of stmt.statements) {
        await this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
    return null;
  }

  visitFunctionStmt(stmt: FunctionStmt) {
    const func = new FunctionCallable(stmt, this.environment);
    this.environment.assign(stmt.name.lexeme, func);
    return null;
  }

  async visitIfStmt(stmt: IfStmt) {
    if (this.mode === "execute") {
      if (this.isTruthy(this.evaluate(stmt.condition))) {
        for (const statement of stmt.thenBranch) {
          await this.execute(statement);
        }
      } else {
        // Check else-if conditions
        for (let i = 0; i < stmt.elseIfConditions.length; i++) {
          if (this.isTruthy(this.evaluate(stmt.elseIfConditions[i]))) {
            for (const statement of stmt.elseIfBranches[i]) {
              await this.execute(statement);
            }
            return null;
          }
        }
        
        // Execute else branch
        for (const statement of stmt.elseBranch) {
          await this.execute(statement);
        }
      }
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.condition);
      } catch (error) {
        this.addError(`Invalid condition expression in if statement: ${(error as Error).message}`);
      }
      
      // Validate else-if conditions
      for (let i = 0; i < stmt.elseIfConditions.length; i++) {
        try {
          this.evaluate(stmt.elseIfConditions[i]);
        } catch (error) {
          this.addError(`Invalid condition expression in else-if statement: ${(error as Error).message}`);
        }
      }
    }
    return null;
  }

  visitPrintStmt(stmt: PrintStmt) {
    if (this.mode === "execute") {
      const value = this.evaluate(stmt.expression);
      console.log(value);
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.expression);
      } catch (error) {
        this.addError(`Invalid expression in print statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  async visitWhileStmt(stmt: WhileStmt) {
    if (this.mode === "execute") {
      while (this.isTruthy(this.evaluate(stmt.condition))) {
        for (const statement of stmt.body) {
          await this.execute(statement);
        }
      }
    } else {
      // Validate mode - check for errors
      try {
        this.evaluate(stmt.condition);
      } catch (error) {
        this.addError(`Invalid condition expression in while statement: ${(error as Error).message}`);
      }
    }
    return null;
  }

  evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  async execute(statement: Stmt) {
    return await statement.accept(this);
  }

  visitUnaryExpr(expr: Unary) {
    const right = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.NOT:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -right;
      case TokenType.PLUS:
        return +right;
      default:
        break;
    }
  }

  visitExpressionStmt(stmt: ExpressionStmt) {
    this.evaluate(stmt.expression);
    return null;
  }

  visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  visitLogicalExpr(expr: Logical) {
    const left = this.evaluate(expr.left);
    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) {
        return left;
      }
    } else {
      if (!this.isTruthy(left)) {
        return left;
      }
    }

    return this.evaluate(expr.right);
  }

  visitBinaryExpr(expr: Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.GREATER_THAN:
        return left > right;
      case TokenType.GREATER_THAN_EQUAL:
        return left >= right;
      case TokenType.LESS_THAN:
        return left < right;
      case TokenType.LESS_THAN_EQUAL:
        return left <= right;
      case TokenType.PLUS:
        return left + right;
      case TokenType.MINUS:
        return left - right;
      case TokenType.STAR:
        return left * right;
      case TokenType.SLASH:
        return left / right;
      case TokenType.EQUAL_EQUAL:
        return left === right;
      case TokenType.NOT_EQUAL:
        return left !== right;
      default:
        break;
    }
  }

  isTruthy(object: any) {
    return Boolean(object);
  }

  isEqual(a: any, b: any) {
    return a === b;
  }
}
