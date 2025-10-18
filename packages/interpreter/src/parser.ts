import {
  Expr,
  Assign,
  Variable,
  Logical,
  Binary,
  Unary,
  Literal,
} from "./expr";
import {
  CheckboxStmt,
  ClickStmt,
  ExpectStmt,
  ExpressionStmt,
  GoStmt,
  HoverStmt,
  PressStmt,
  PrintStmt,
  RefreshStmt,
  SelectStmt,
  SetStmt,
  Stmt,
  TypeStmt,
  WaitStmt,
  ForEachStmt,
  RepeatStmt,
  CallStmt,
  IfStmt,
  FunctionStmt,
  BlockStmt,
} from "./stmt";
import { Token } from "./token";
import { TokenType } from "./token-type";
import { Parameter } from "./parameter";

export class Parser {
  private tokens: Token[];
  private current: number = 0;
  private errors: string[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse() {
    this.errors = []; // Reset errors for each parse
    let statements: Stmt[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.END)) {
      try {
        statements.push(this.statement());
      } catch (error) {
        this.addError((error as Error).message);
        // Try to recover by skipping to the next statement
        this.synchronize();
      }
    }
    return statements;
  }

  getErrors(): string[] {
    return this.errors;
  }

  private addError(message: string) {
    this.errors.push(message);
  }

  private synchronize() {
    this.advance();
    
    while (!this.isAtEnd()) {
      switch (this.peek().type) {
        case TokenType.IF:
        case TokenType.DEFINE:
        case TokenType.CALL:
        case TokenType.FOR:
        case TokenType.REPEAT:
        case TokenType.PRINT:
        case TokenType.GO:
        case TokenType.CLICK:
        case TokenType.TYPE:
        case TokenType.WAIT:
        case TokenType.CHECK:
        case TokenType.UNCHECK:
        case TokenType.PRESS:
        case TokenType.HOVER:
        case TokenType.SELECT:
        case TokenType.EXPECT:
        case TokenType.SET:
        case TokenType.END:
          return;
      }
      
      this.advance();
    }
  }

  statement(): Stmt {
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.DEFINE)) {
      return this.functionStatement();
    }
    if (this.match(TokenType.CALL)) {
      return this.callStatement();
    }
    if (this.match(TokenType.FOR)) {
      return this.forEachStatement();
    }
    if (this.match(TokenType.REPEAT)) {
      return this.repeatStatement();
    }
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.GO)) {
      return this.goStatement();
    }
    if (this.match(TokenType.CLICK)) {
      return this.clickStatement();
    }
    if (this.match(TokenType.TYPE)) {
      return this.typeStatement();
    }
    if (this.match(TokenType.WAIT)) {
      return this.waitStatement();
    }
    if (this.match(TokenType.CHECK, TokenType.UNCHECK)) {
      return this.checkboxStatement();
    }
    if (this.match(TokenType.PRESS)) {
      return this.pressStatement();
    }

    if (this.match(TokenType.HOVER)) {
      return this.hoverStatement();
    }

    if (this.match(TokenType.SELECT)) {
      return this.selectStatement();
    }

    if (this.match(TokenType.EXPECT)) {
      return this.expectStatement();
    }

    if(this.match(TokenType.SET)) {
      return this.setStatement();
    }

    return this.expressionStatement();
  }

  goStatement() {
    let action: Token;
    let target: Expr | null = null;

    if (this.match(TokenType.TO)) {
      action = this.previous();
      target = this.expression();
    } else if (this.match(TokenType.BACK)) {
      action = this.previous();
    } else if (this.match(TokenType.FORWARD)) {
      action = this.previous();
    } else {
      throw this.error(this.previous(), "Expected 'to', 'back', or 'forward' after 'go' command.");
    }

    return new GoStmt(
      action.lexeme as "to" | "back" | "forward",
      target ?? undefined
    );
  }

  clickStatement() {
    let selector: Expr | null = null;
    let modifier;
    let value = null;

    if (this.match(TokenType.THE, TokenType.ALL)) {
      if (this.match(TokenType.ORDINAL)) {
        modifier = "nth";
        value = this.previous().literal;
      } else if (this.match(TokenType.LAST)) {
        modifier = "last";
      } else {
        modifier = "all";
      }
    }

    selector = this.expression();

    return new ClickStmt(
      selector!,
      modifier as "nth" | "last" | "all",
      value! as number
    );
  }

  hoverStatement() {
    this.consume(TokenType.OVER, "Expected 'over' after 'hover' command.");
    const selector = this.expression();
    return new HoverStmt(selector);
  }

  pressStatement() {
    let key = this.expression();

    return new PressStmt(key);
  }

  checkboxStatement() {
    const action = this.previous().lexeme;
    const selector = this.expression();

    return new CheckboxStmt(action as "check" | "uncheck", selector);
  }

  selectStatement() {
    let value = this.expression();
    this.consume(TokenType.FROM, "Expected 'from' after select value.");
    let selector = this.expression();

    return new SelectStmt(value, selector);
  }

  getStatement() {}

  refreshStatement() {
    this.consume(TokenType.PAGE, "Expected 'page' after 'refresh' command.");
    return new RefreshStmt();
  }

  typeStatement() {
    let value = this.expression();
    this.consume(TokenType.INTO, "Expected 'into' after type value.");
    let selector = this.expression();
    return new TypeStmt(value, selector);
  }

  expectStatement() {
    // Page title expectations
    if (this.match(TokenType.PAGE)) {
      this.consume(TokenType.TITLE, "Expected 'title' after 'page' in expect statement.");
      this.consume(TokenType.TO, "Expected 'to' after 'title' in expect statement.");
      if (this.match(TokenType.BE)) {
        const expected = this.expression();
        return new ExpectStmt("page title", null, "to be", expected);
      }
      if (this.match(TokenType.CONTAIN)) {
        const expected = this.expression();
        return new ExpectStmt("page title", null, "to contain", expected);
      }
      throw this.error(this.previous(), "Expected 'be' or 'contain' after 'to' in page title expectation.");
    }

    // URL expectations
    if (this.match(TokenType.URL)) {
      this.consume(TokenType.TO, "Expected 'to' after 'url' in expect statement.");
      if (this.match(TokenType.CONTAIN)) {
        const expected = this.expression();
        return new ExpectStmt("url", null, "to contain", expected);
      }
      if (this.match(TokenType.BE)) {
        const expected = this.expression();
        return new ExpectStmt("url", null, "to be", expected);
      }
      throw this.error(this.previous(), "Expected 'contain' or 'be' after 'to' in URL expectation.");
    }

    // Element expectations
    const selector = this.expression();
    this.consume(TokenType.TO, "Expected 'to' after element selector in expect statement.");
    if (this.match(TokenType.BE)) {
      if (this.match(
        TokenType.VISIBLE,
        TokenType.HIDDEN,
        TokenType.ENABLED,
        TokenType.DISABLED,
        TokenType.CHECKED
      )) {
        const stateToken = this.previous();
        const state = stateToken.lexeme as
          | "visible"
          | "hidden"
          | "enabled"
          | "disabled"
          | "checked";
        return new ExpectStmt("element", selector, "to be", state);
      }
      throw this.error(this.previous(), "Expected a visibility state (visible, hidden, enabled, disabled, checked) after 'be'.");
    }

    if (this.match(TokenType.CONTAIN)) {
      const expected = this.expression();
      return new ExpectStmt("element", selector, "to contain", expected);
    }

    if (this.match(TokenType.HAVE)) {
      this.consume(TokenType.TEXT, "Expected 'text' after 'have' in expect statement.");
      const expected = this.expression();
      return new ExpectStmt("element", selector, "to have text", expected);
    }

    throw this.error(this.previous(), "Invalid expect statement. Expected 'page title', 'url', or element selector.");
  }

  expectPageStatement() {}

  waitStatement() {
    this.consume(TokenType.FOR, "Expected 'for' after 'wait' command.");

    // wait for page to load
    if (this.match(TokenType.PAGE)) {
      this.consume(TokenType.TO, "Expected 'to' after 'page' in wait statement.");
      this.consume(TokenType.LOAD, "Expected 'load' after 'to' in wait statement.");
      return new WaitStmt("page");
    }

    // wait for "selector" to appear/disappear
    // or wait for 2 seconds
    const expr = this.expression();

    if (this.match(TokenType.TO)) {
      const condition = this.match(TokenType.APPEAR)
        ? "appear"
        : this.match(TokenType.DISAPPEAR)
        ? "disappear"
        : this.error(this.previous(), "Expected 'appear' or 'disappear' after 'to' in wait statement.");
      return new WaitStmt("element", expr, condition);
    }

    if (this.match(TokenType.SECOND, TokenType.SECONDS)) {
      return new WaitStmt("time", expr);
    }

    throw this.error(this.previous(), "Expected 'to' (for element conditions) or 'second'/'seconds' (for time) after wait expression.");
  }

  setStatement() {
    let target = this.consume(TokenType.IDENTIFIER, "Expected variable name after 'set' command.");
    this.consume(TokenType.TO, "Expected 'to' after variable name in set statement.");
    let value = this.expression();
    return new SetStmt(target.lexeme, value);
  }

  expressionStatement() {
    const expr: Expr = this.expression();
    return new ExpressionStmt(expr);
  }

  expression(): Expr {
    return this.assignment();
  }

  printStatement() {
    const value = this.or();
    return new PrintStmt(value);
  }

  private assignment(): Expr {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      const name = (expr as Variable).name;
      return new Assign(name, value);
    }

    return expr;
  }

  private or(): Expr {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.NOT_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER_THAN,
        TokenType.GREATER_THAN_EQUAL,
        TokenType.LESS_THAN,
        TokenType.LESS_THAN_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.TRUE_LITERAL)) return new Literal(true);
    if (this.match(TokenType.FALSE_LITERAL)) return new Literal(false);
    if (this.match(TokenType.NUMBER_LITERAL, TokenType.STRING_LITERAL))
      return new Literal(this.previous().literal);
    if (this.match(TokenType.IDENTIFIER)) return new Variable(this.previous());

    throw this.error(this.peek(), "Expected an expression (number, string, variable, or function call).");
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  peek() {
    return this.tokens[this.current];
  }

  peekNext() {
    return this.tokens[this.current + 1];
  }

  advance() {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type: TokenType) {
    if (this.isAtEnd()) {
      return false;
    }

    return this.peek().type === type;
  }

  consume(type: TokenType, message: string) {
    if (this.check(type)) {
      return this.advance();
    }

    const errorMessage = this.formatError(this.peek(), message);
    this.addError(errorMessage);
    throw new Error(errorMessage); // Still throw for now to maintain existing behavior
  }

  private error(token: Token, message: string): never {
    const errorMessage = this.formatError(token, message);
    this.addError(errorMessage);
    throw new Error(errorMessage);
  }

  private formatError(token: Token, message: string): string {
    const location = `at line ${token.line}`;
    const tokenInfo = token.type === 'EOF' ? 'end of file' : `'${token.lexeme}'`;
    return `Syntax Error ${location}: ${message} (found ${tokenInfo})`;
  }

  // New parsing methods for if/else, loops, and functions
  ifStatement(): Stmt {
    const condition = this.ifCondition();
    const thenBranch = this.block();
    
    let elseIfConditions: Expr[] = [];
    let elseIfBranches: Stmt[][] = [];
    let elseBranch: Stmt[] = [];

    // Handle else-if chains
    while (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.IF)) {
        elseIfConditions.push(this.ifCondition());
        elseIfBranches.push(this.block());
      } else {
        elseBranch = this.block();
        break;
      }
    }

    this.consume(TokenType.END, "Expected 'end' to close if statement.");

    return new IfStmt(condition, thenBranch, elseIfConditions, elseIfBranches, elseBranch);
  }

  ifCondition(): Expr {
    // Handle element selector conditions: "selector" is visible
    if (this.match(TokenType.STRING_LITERAL)) {
      const selector = this.previous();
      this.consume(TokenType.IS, "Expected 'is' after element selector in if condition.");
      
      if (this.match(TokenType.VISIBLE, TokenType.HIDDEN, TokenType.ENABLED, TokenType.DISABLED, TokenType.CHECKED)) {
        const state = this.previous();
        return new Binary(
          new Literal(selector.literal),
          new Token(TokenType.EQUAL_EQUAL, "==", null, 0),
          new Literal(state.lexeme)
        );
      }
      throw this.error(this.previous(), "Expected visibility state (visible, hidden, enabled, disabled, checked) after 'is'.");
    }
    
    // Handle variable comparisons: variable equals value
    if (this.match(TokenType.IDENTIFIER)) {
      const variable = this.previous();
      this.consume(TokenType.EQUALS, "Expected 'equals' after variable in if condition.");
      const value = this.expression();
      return new Binary(
        new Variable(variable),
        new Token(TokenType.EQUAL_EQUAL, "==", null, 0),
        value
      );
    }

    // Handle general expressions: if expression (like if 1, if true, if variable)
    return this.expression();
  }

  block(): Stmt[] {
    const statements: Stmt[] = [];
    
    while (!this.isAtEnd() && !this.check(TokenType.END) && !this.check(TokenType.ELSE)) {
      statements.push(this.statement());
    }
    
    return statements;
  }

  functionStatement(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name after 'define' command.");
    
    // Parse parameters if present
    const params: Parameter[] = [];
    if (this.match(TokenType.WITH)) {
      // Parse parameter list
      do {
        const paramName = this.consume(TokenType.IDENTIFIER, "Expected parameter name after 'with' in function definition.");
        params.push(new Parameter(
          new Token(TokenType.IDENTIFIER, "any", null, 0), // Type (default to any)
          paramName
        ));
      } while (this.match(TokenType.COMMA));
    }
    
    this.consume(TokenType.AS, "Expected 'as' after function name and parameters in function definition.");
    
    const body: Stmt[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.END)) {
      body.push(this.statement());
    }
    
    this.consume(TokenType.END, "Expected 'end' to close function definition.");
    
    return new FunctionStmt(
      name,
      params,
      body,
      new Token(TokenType.IDENTIFIER, "void", null, 0) // Return type
    );
  }

  callStatement(): Stmt {
    const functionName = this.consume(TokenType.IDENTIFIER, "Expected function name after 'call' command.");
    const args: Expr[] = [];
    
    if (this.match(TokenType.WITH)) {
      // Parse arguments
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    
    return new CallStmt(functionName.lexeme, args);
  }

  forEachStatement(): Stmt {
    this.consume(TokenType.EACH, "Expected 'each' after 'for' in for-each loop.");
    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name in for-each loop.");
    this.consume(TokenType.IN, "Expected 'in' after variable name in for-each loop.");
    const collection = this.expression();
    
    const body: Stmt[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.END)) {
      body.push(this.statement());
    }
    
    this.consume(TokenType.END, "Expected 'end' to close for-each loop.");
    
    return new ForEachStmt(variable.lexeme, collection, body);
  }

  repeatStatement(): Stmt {
    let count: Expr | number;
    
    if (this.match(TokenType.NUMBER_LITERAL)) {
      count = this.previous().literal as number;
    } else {
      count = this.expression();
    }
    
    this.consume(TokenType.TIMES, "Expected 'times' after repeat count.");
    
    const body: Stmt[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.END)) {
      body.push(this.statement());
    }
    
    this.consume(TokenType.END, "Expected 'end' to close repeat loop.");
    
    return new RepeatStmt(count, body);
  }
}
