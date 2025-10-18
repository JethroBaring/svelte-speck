import { readFile } from "fs/promises";
import { Scanner } from "./scanner.js";
import { Parser } from "./parser.js";
import { Interpreter } from "./interpreter.js";

class Code {
  public static async run() {
    console.log("Starting code execution...");
    
    const file = Bun.file("./src/interpreter/test.dsl");
    const source = await file.text();
    console.log("Source:", source);
    
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    console.log("Tokens:", tokens.length);
    
    const parser = new Parser(tokens);
    const statements = parser.parse();
    console.log("Statements:", statements.length);
    
    // Get parser errors
    const parserErrors = parser.getErrors();
    console.log("Parser errors:", parserErrors);
    
    const interpreter = new Interpreter(undefined, "validate");
    const interpreterErrors = await interpreter.interpret(statements);
    console.log("Interpreter errors:", interpreterErrors);
    
    // Combine all errors
    const allErrors = [...parserErrors, ...(interpreterErrors || [])];
    console.log("All errors:", allErrors);
  }
}
Code.run();
