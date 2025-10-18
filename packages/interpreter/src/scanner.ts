import { TokenType } from "./token-type.js";
import { Token } from "./token.js";

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;
  private readonly keywords: Map<string, TokenType>;

  constructor(source: string) {
    this.source = source;
    this.keywords = new Map();
    this.keywords.set("go", TokenType.GO);
    this.keywords.set("to", TokenType.TO);
    this.keywords.set("back", TokenType.BACK);
    this.keywords.set("forward", TokenType.FORWARD);
    this.keywords.set("type", TokenType.TYPE);
    this.keywords.set("click", TokenType.CLICK);
    this.keywords.set("press", TokenType.PRESS);
    this.keywords.set("into", TokenType.INTO);
    this.keywords.set("or", TokenType.OR);
    this.keywords.set("and", TokenType.AND);
    this.keywords.set("if", TokenType.IF);
    this.keywords.set("else", TokenType.ELSE);
    this.keywords.set("end", TokenType.END);
    this.keywords.set("is", TokenType.IS);
    this.keywords.set("equals", TokenType.EQUALS);
    this.keywords.set("define", TokenType.DEFINE);
    this.keywords.set("as", TokenType.AS);
    this.keywords.set("call", TokenType.CALL);
    this.keywords.set("with", TokenType.WITH);
    this.keywords.set("for", TokenType.FOR);
    this.keywords.set("each", TokenType.EACH);
    this.keywords.set("in", TokenType.IN);
    this.keywords.set("repeat", TokenType.REPEAT);
    this.keywords.set("times", TokenType.TIMES);
    this.keywords.set("print", TokenType.PRINT);
    this.keywords.set("be", TokenType.BE);
    this.keywords.set("visible", TokenType.VISIBLE);
    this.keywords.set("hidden", TokenType.HIDDEN);
    this.keywords.set("contain", TokenType.CONTAIN);
    this.keywords.set("enabled", TokenType.ENABLED);
    this.keywords.set("disabled", TokenType.DISABLED);
    this.keywords.set("checked", TokenType.CHECKED);
    this.keywords.set("check", TokenType.CHECK);
    this.keywords.set("uncheck", TokenType.UNCHECK);
    this.keywords.set("page", TokenType.PAGE);
    this.keywords.set("title", TokenType.TITLE);
    this.keywords.set("url", TokenType.URL);
    this.keywords.set("the", TokenType.THE);
    this.keywords.set("all", TokenType.ALL);
    this.keywords.set("last", TokenType.LAST);
    this.keywords.set("from", TokenType.FROM);
    this.keywords.set("wait", TokenType.WAIT);
    this.keywords.set("select", TokenType.SELECT);
    this.keywords.set("open", TokenType.OPEN);
    this.keywords.set("close", TokenType.CLOSE);
    this.keywords.set("hover", TokenType.HOVER);
    this.keywords.set("over", TokenType.OVER);
    this.keywords.set("scroll", TokenType.SCROLL);
    this.keywords.set("assert", TokenType.ASSERT);
    this.keywords.set("expect", TokenType.EXPECT);
    this.keywords.set("call", TokenType.CALL);
    this.keywords.set("set", TokenType.SET);
    this.keywords.set("as", TokenType.AS);
    this.keywords.set("get", TokenType.GET);
    this.keywords.set("have", TokenType.HAVE);
    this.keywords.set("text", TokenType.TEXT);
    this.keywords.set("value", TokenType.VALUE);
    this.keywords.set("else", TokenType.ELSE);
    this.keywords.set("then", TokenType.THEN);
    this.keywords.set("end", TokenType.END);
    this.keywords.set("over", TokenType.OVER);
    this.keywords.set("for", TokenType.FOR);
    this.keywords.set("second", TokenType.SECOND);
    this.keywords.set("seconds", TokenType.SECONDS);
    this.keywords.set("appear", TokenType.APPEAR);
    this.keywords.set("disappear", TokenType.DISAPPEAR);
    this.keywords.set("load", TokenType.LOAD);
    this.keywords.set("refresh", TokenType.REFRESH);
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  scanToken() {
    const char = this.advance();
    switch (char) {
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "/":
        this.addToken(TokenType.SLASH);
        break;
      case "=":
        if (this.match("=")) this.addToken(TokenType.EQUAL_EQUAL);
        else this.addToken(TokenType.EQUAL);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ">":
        if (this.match("=")) this.addToken(TokenType.GREATER_THAN_EQUAL);
        else this.addToken(TokenType.GREATER_THAN);
        break;
      case "<":
        if (this.match("=")) this.addToken(TokenType.LESS_THAN_EQUAL);
        else this.addToken(TokenType.LESS_THAN);
        break;
      case '"':
        this.string();
        break;
      case "\0":
      case " ":
      case "\t":
      case "\r":
        break;
      case "\n":
        this.line++;
        break;
      default:
        if (this.isDigit(char)) this.number();
        else if (this.isAlpha(char)) this.identifier();
        else
          console.error(this.line, this.current, "Unexpected character.", char);
        break;
    }
  }

  private isAtEnd() {
    return this.current >= this.source.length;
  }

  private advance() {
    this.current++;
    return this.source.charAt(this.current - 1);
  }

  private addToken(type: TokenType, literal: any = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private match(expected: string) {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private isAtNewLine() {
    if (this.current < this.source.length)
      return this.source.charAt(this.current) === "\n";
    return false;
  }

  private peek() {
    if (this.isAtEnd()) {
      return "\0";
    }

    return this.source.charAt(this.current);
  }

  private peekNext() {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }

    return this.source.charAt(this.current + 1);
  }

  private isAlpha(c: string): boolean {
    return (
      (c >= "a" && c <= "z") ||
      (c >= "A" && c <= "Z") ||
      c === "_" ||
      c === "." ||
      c === "#" ||
      c === "$"
    );
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private isFloat(value: string): boolean {
    return value.includes(".");
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }
    if (this.isAtEnd()) {
      console.error(this.line, this.current, "Unterminated string.");
      return;
    }
    // closing quote
    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1);
    if (value === "TRUE") {
      this.addToken(TokenType.TRUE_LITERAL, value);
    } else if (value === "FALSE") {
      this.addToken(TokenType.FALSE_LITERAL, value);
    } else {
      this.addToken(TokenType.STRING_LITERAL, value);
    }
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    // Capture the numeric portion for potential ordinal detection
    const numericText = this.source.substring(this.start, this.current);
    
    // If letters follow the number, check for ordinal suffixes (st, nd, rd, th)
    if (this.isAlpha(this.peek())) {
      // Only treat as ordinal when the number is an integer (no decimal point)
      const isInteger = !numericText.includes(".");

      if (isInteger) {
        const c1 = this.peek().toLowerCase();
        const c2 = this.peekNext().toLowerCase();
        const suffix = c1 + c2;
        const isOrdinalSuffix = suffix === "st" || suffix === "nd" || suffix === "rd" || suffix === "th";
        // Ensure exactly two-letter suffix and that it is not followed by more alphanumerics
        const c3 = this.current + 2 < this.source.length ? this.source.charAt(this.current + 2) : "\0";

        if (isOrdinalSuffix && !this.isAlphaNumeric(c3)) {
          // consume the two-letter suffix
          this.advance();
          this.advance();
          this.addToken(TokenType.ORDINAL, parseInt(numericText, 10));
          return;
        }
      }

      // Fallback: consume the rest of the alphanumeric run and return (invalid numeric literal)
      while (this.isAlphaNumeric(this.peek())) {
        this.advance();
      }
      return;
    }

    this.addToken(TokenType.NUMBER_LITERAL, parseFloat(numericText));
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const text = this.source.substring(this.start, this.current);
    let type = this.keywords.get(text);
    if (type === null || type === undefined) {
      type = TokenType.IDENTIFIER;
    }
    this.addToken(type as TokenType);
  }
}
