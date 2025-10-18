import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import websocketService from './websocket.service';
import minioService from './minio.service';
import { Scanner, Parser, Interpreter, Environment } from '@repo/interpreter';

enum TestStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  TIMEOUT = 'TIMEOUT',
  ERROR = 'ERROR'
}

enum StepContextType {
  NONE = 'NONE',
  LOOP = 'LOOP',
  FOREACH = 'FOREACH',
  CONDITIONAL = 'CONDITIONAL',
  FUNCTION = 'FUNCTION',
  CALL = 'CALL'
}

interface JobData {
  code: string;
  setupState?: SetupState;
  testCaseRunId: string;
  testSuiteRunId: string;
  projectVariablesHash?: [string, any][];
  testSuiteVariablesHash?: [string, any][];
  projectFunctionsHash?: [string, any][];
  testSuiteFunctionsHash?: [string, any][];
}

interface SetupState {
  cookies?: any[];
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  url?: string;
}

interface TestStepResult {
  id?: string;
  testCaseRunId: string;
  stepNumber: number;
  stepName?: string;
  stmtType?: string;
  lineNumber?: number;
  parentStepResultId?: string;
  iteration?: number;
  contextType: StepContextType;
  contextName?: string;
  // metadata?: Record<string, any>;
  status: TestStepStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  errorMessage?: string;
  screenshot?: string;
  logs?: string;
}

interface ExecutionResult {
  success: boolean;
  results: TestStepResult[];
  duration: number;
  error?: string;
  screenshotUrl?: string | null;
}

class ExecutionService {
  private projectVariablesHash: Map<string, any>;
  private testSuiteVariablesHash: Map<string, any>;
  private projectFunctionsHash: Map<string, any>;
  private testSuiteFunctionsHash: Map<string, any>;
  private interpreter: Interpreter;
  private environment: Environment;
  private stepNumber: number;
  private contextStack: Array<{ type: StepContextType; name?: string; iteration?: number }>;

  constructor() {
    this.projectVariablesHash = new Map();
    this.testSuiteVariablesHash = new Map();
    this.projectFunctionsHash = new Map();
    this.testSuiteFunctionsHash = new Map();
    this.environment = new Environment();
    this.interpreter = new Interpreter(this.environment, 'execute');
    this.stepNumber = 0;
    this.contextStack = [];
  }

  async executeTestCase(jobData: JobData): Promise<ExecutionResult> {
    const { code, setupState, testCaseRunId, testSuiteRunId } = jobData;
    const startTime = Date.now();
    let browser: Browser | undefined;
    let page: Page | undefined;
    const results: TestStepResult[] = [];

    try {
      // Reset execution state
      this.resetStepNumber();
      this.contextStack = [];

      // Parse and validate the DSL code
      const scanner = new Scanner(code);
      const tokens = scanner.scanTokens();
      const parser = new Parser(tokens);
      const statements = parser.parse();

      // Check for parser errors
      const parserErrors = parser.getErrors();
      if (parserErrors.length > 0) {
        throw new Error(`Parser errors: ${parserErrors.join(', ')}`);
      }

      browser = await this.launchBrowser();
      page = await browser.newPage();

      // Load variables and functions into the environment first
      this.loadVariablesAndFunctions();

      // Set up the interpreter with the page
      this.interpreter = new Interpreter(this.environment, 'execute', page);

      // Apply setup state if provided
      if (setupState) {
        await this.applySetupState(page, setupState);
      }

      await this.executeTestCommands(page, statements, testCaseRunId, testSuiteRunId, results);
      const duration = Date.now() - startTime;

      console.log('✅ Test completed successfully');
      return {
        success: true,
        results,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Test failed:', (error as Error).message);

      const screenshotUrl = await this.captureErrorScreenshot(page, testCaseRunId);
      return {
        success: false,
        error: (error as Error).message,
        results,
        screenshotUrl,
        duration
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async launchBrowser(): Promise<Browser> {
    return await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  private loadVariablesAndFunctions(): void {
    // Load project variables
    this.projectVariablesHash.forEach((value, key) => {
      this.environment.assign(key, value);
    });

    // Load test suite variables (these override project variables)
    this.testSuiteVariablesHash.forEach((value, key) => {
      this.environment.assign(key, value);
    });

    // Load project functions
    this.projectFunctionsHash.forEach((value, key) => {
      this.environment.assign(key, value);
    });

    // Load test suite functions (these override project functions)
    this.testSuiteFunctionsHash.forEach((value, key) => {
      this.environment.assign(key, value);
    });
  }

  private pushContext(type: StepContextType, name?: string, iteration?: number): void {
    this.contextStack.push({ type, name, iteration });
  }

  private popContext(): void {
    this.contextStack.pop();
  }

  private getCurrentContext(): { type: StepContextType; name?: string; iteration?: number } | null {
    return this.contextStack.length > 0 ? this.contextStack[this.contextStack.length - 1] : null;
  }

  private incrementStepNumber(): number {
    this.stepNumber++;
    return this.stepNumber;
  }

  private resetStepNumber(): void {
    this.stepNumber = 0;
  }

  private extractStatementMetadata(statement: any): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    if (statement.constructor.name === 'ClickStmt') {
      metadata.selector = statement.selector;
    } else if (statement.constructor.name === 'TypeStmt') {
      metadata.selector = statement.selector;
      metadata.value = statement.value;
    } else if (statement.constructor.name === 'GoStmt') {
      metadata.action = statement.action;
      metadata.target = statement.target;
    } else if (statement.constructor.name === 'WaitStmt') {
      metadata.type = statement.type;
      metadata.value = statement.value;
      metadata.selector = statement.selector;
      metadata.condition = statement.condition;
    } else if (statement.constructor.name === 'ExpectStmt') {
      metadata.type = statement.type;
      metadata.target = statement.target;
      metadata.operator = statement.operator;
      metadata.expected = statement.expected || statement.state;
    } else if (statement.constructor.name === 'CallStmt') {
      metadata.functionName = statement.functionName;
      metadata.args = statement.args;
    } else if (statement.constructor.name === 'SetStmt') {
      metadata.target = statement.target;
      metadata.value = statement.value;
    } else if (statement.constructor.name === 'PrintStmt') {
      metadata.value = statement.value;
    } else if (statement.constructor.name === 'RepeatStmt') {
      metadata.count = statement.count;
    } else if (statement.constructor.name === 'ForEachStmt') {
      metadata.variable = statement.variable;
      metadata.collection = statement.collection;
    } else if (statement.constructor.name === 'FunctionStmt') {
      metadata.name = statement.name.lexeme;
      metadata.parameters = statement.params.map((p: any) => p.name.lexeme);
    }

    // Add evaluated variables from environment
    metadata.evaluatedVars = {};
    this.environment.values.forEach((variable: any, key: string) => {
      metadata.evaluatedVars[key] = variable.getValue ? variable.getValue() : variable;
    });

    return metadata;
  }

  private getStatementContextType(statement: any): StepContextType {
    const stmtName = statement.constructor.name;
    
    if (stmtName === 'RepeatStmt') {
      return StepContextType.LOOP;
    } else if (stmtName === 'ForEachStmt') {
      return StepContextType.FOREACH;
    } else if (stmtName === 'IfStmt') {
      return StepContextType.CONDITIONAL;
    } else if (stmtName === 'FunctionStmt') {
      return StepContextType.FUNCTION;
    } else if (stmtName === 'CallStmt') {
      return StepContextType.CALL;
    }
    
    return StepContextType.NONE;
  }

  private async executeTestCommands(
    page: Page,
    statements: any[],
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[]
  ): Promise<TestStepResult[]> {
    console.log(`📝 Processing ${statements.length} statements`);

    this.resetStepNumber();
    this.contextStack = [];

    await this.executeStatementsRecursively(
      page,
      statements,
      testCaseRunId,
      testSuiteRunId,
      results
    );

    return results;
  }

  private async executeStatementsRecursively(
    page: Page,
    statements: any[],
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[],
    parentStepResultId?: string
  ): Promise<void> {
    for (const statement of statements) {
      const stepNumber = this.incrementStepNumber();
      const stmtType = statement.constructor.name;
      const stepName = this.getStatementDescription(statement);
      const contextType = this.getStatementContextType(statement);
      const currentContext = this.getCurrentContext();
      const metadata = this.extractStatementMetadata(statement);

      console.log(`⚡ Step ${stepNumber}: ${stepName}`);

      const stepResult: TestStepResult = {
        testCaseRunId,
        stepNumber,
        stepName,
        stmtType,
        parentStepResultId,
        iteration: currentContext?.iteration,
        contextType: currentContext?.type || StepContextType.NONE,
        contextName: currentContext?.name,
        // metadata,
        status: TestStepStatus.RUNNING,
        startedAt: new Date()
      };

      try {
        await websocketService.notifyTestStepStarted(testCaseRunId, testSuiteRunId, stepNumber);

        // Handle special control flow statements
        if (stmtType === 'RepeatStmt') {
          await this.handleRepeatStatement(page, statement, testCaseRunId, testSuiteRunId, results, stepResult);
        } else if (stmtType === 'ForEachStmt') {
          await this.handleForEachStatement(page, statement, testCaseRunId, testSuiteRunId, results, stepResult);
        } else if (stmtType === 'IfStmt') {
          await this.handleIfStatement(page, statement, testCaseRunId, testSuiteRunId, results, stepResult);
        } else if (stmtType === 'FunctionStmt') {
          await this.handleFunctionStatement(page, statement, testCaseRunId, testSuiteRunId, results, stepResult);
        } else {
          // Execute regular statement
          await this.interpreter.execute(statement);
          await this.completeStepResult(page, stepResult, testCaseRunId, testSuiteRunId, results);
        }
      } catch (error) {
        console.error(`❌ Step ${stepNumber} failed:`, (error as Error).message);
        await this.failStepResult(stepResult, testCaseRunId, testSuiteRunId, results, error as Error);
      }
    }
  }

  private async handleRepeatStatement(
    page: Page,
    statement: any,
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[],
    parentStepResult: TestStepResult
  ): Promise<void> {
    const count = statement.count;
    const body = statement.body || [];
    
    // Complete the repeat statement step
    parentStepResult.status = TestStepStatus.PASSED;
    parentStepResult.completedAt = new Date();
    parentStepResult.duration = parentStepResult.completedAt.getTime() - parentStepResult.startedAt.getTime();
    results.push(parentStepResult);

    // Push context for the loop
    this.pushContext(StepContextType.LOOP, `repeat ${count} times`);

    // Execute the body for each iteration
    for (let i = 1; i <= count; i++) {
      this.pushContext(StepContextType.LOOP, `repeat ${count} times`, i);
      await this.executeStatementsRecursively(
        page,
        body,
        testCaseRunId,
        testSuiteRunId,
        results,
        parentStepResult.id
      );
      this.popContext();
    }

    this.popContext();
  }

  private async handleForEachStatement(
    page: Page,
    statement: any,
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[],
    parentStepResult: TestStepResult
  ): Promise<void> {
    const variable = statement.variable;
    const collection = statement.collection;
    const body = statement.body || [];
    
    // Complete the foreach statement step
    parentStepResult.status = TestStepStatus.PASSED;
    parentStepResult.completedAt = new Date();
    parentStepResult.duration = parentStepResult.completedAt.getTime() - parentStepResult.startedAt.getTime();
    results.push(parentStepResult);

    // Push context for the foreach
    this.pushContext(StepContextType.FOREACH, `for each ${variable} in ${collection}`);

    // Get the collection value from environment
    const collectionValue = this.environment.get(collection);
    if (Array.isArray(collectionValue)) {
      // Execute the body for each item
      for (let i = 0; i < collectionValue.length; i++) {
        const item = collectionValue[i];
        // Set the variable in the environment
        this.environment.assign(variable, item);
        
        this.pushContext(StepContextType.FOREACH, `for each ${variable} in ${collection}`, i + 1);
        await this.executeStatementsRecursively(
          page,
          body,
          testCaseRunId,
          testSuiteRunId,
          results,
          parentStepResult.id
        );
        this.popContext();
      }
    }

    this.popContext();
  }

  private async handleIfStatement(
    page: Page,
    statement: any,
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[],
    parentStepResult: TestStepResult
  ): Promise<void> {
    const condition = statement.condition;
    const thenBranch = statement.thenBranch || [];
    const elseBranch = statement.elseBranch || [];
    const elseIfConditions = statement.elseIfConditions || [];
    const elseIfBranches = statement.elseIfBranches || [];
    
    // Complete the if statement step
    parentStepResult.status = TestStepStatus.PASSED;
    parentStepResult.completedAt = new Date();
    parentStepResult.duration = parentStepResult.completedAt.getTime() - parentStepResult.startedAt.getTime();
    results.push(parentStepResult);

    // Push context for the conditional
    this.pushContext(StepContextType.CONDITIONAL, 'if statement');

    try {
      // Evaluate the condition
      const conditionResult = this.interpreter.evaluate(condition);
      
      if (conditionResult) {
        await this.executeStatementsRecursively(
          page,
          thenBranch,
          testCaseRunId,
          testSuiteRunId,
          results,
          parentStepResult.id
        );
      } else {
        // Check else-if conditions
        let executed = false;
        for (let i = 0; i < elseIfConditions.length; i++) {
          const elseIfCondition = this.interpreter.evaluate(elseIfConditions[i]);
          if (elseIfCondition) {
            await this.executeStatementsRecursively(
              page,
              elseIfBranches[i],
              testCaseRunId,
              testSuiteRunId,
              results,
              parentStepResult.id
            );
            executed = true;
            break;
          }
        }
        
        // Execute else branch if no else-if was executed
        if (!executed && elseBranch.length > 0) {
          await this.executeStatementsRecursively(
            page,
            elseBranch,
            testCaseRunId,
            testSuiteRunId,
            results,
            parentStepResult.id
          );
        }
      }
    } catch (error) {
      console.error('Error evaluating if condition:', (error as Error).message);
    }

    this.popContext();
  }

  private async handleFunctionStatement(
    page: Page,
    statement: any,
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[],
    parentStepResult: TestStepResult
  ): Promise<void> {
    const name = statement.name.lexeme;
    const params = statement.params || [];
    const body = statement.body || [];
    
    // Complete the function statement step
    parentStepResult.status = TestStepStatus.PASSED;
    parentStepResult.completedAt = new Date();
    parentStepResult.duration = parentStepResult.completedAt.getTime() - parentStepResult.startedAt.getTime();
    results.push(parentStepResult);

    // Push context for the function
    this.pushContext(StepContextType.FUNCTION, `function ${name}`);

    // Register the function in the environment (let the interpreter handle this)
    await this.interpreter.execute(statement);

    this.popContext();
  }

  private async completeStepResult(
    page: Page,
    stepResult: TestStepResult,
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[]
  ): Promise<void> {
    const screenshotUrl = await this.captureScreenshot(page, stepResult.stepNumber, testCaseRunId);
    
    stepResult.status = TestStepStatus.PASSED;
    stepResult.completedAt = new Date();
    stepResult.duration = stepResult.completedAt.getTime() - stepResult.startedAt.getTime();
    stepResult.screenshot = screenshotUrl;

    await websocketService.notifyTestStepCompleted(
      testCaseRunId,
      testSuiteRunId,
      stepResult.stepNumber,
      {
        status: TestStepStatus.PASSED,
        screenshotUrl
      },
      screenshotUrl
    );

    results.push(stepResult);
  }

  private async failStepResult(
    stepResult: TestStepResult,
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[],
    error: Error
  ): Promise<void> {
    stepResult.status = TestStepStatus.FAILED;
    stepResult.completedAt = new Date();
    stepResult.duration = stepResult.completedAt.getTime() - stepResult.startedAt.getTime();
    stepResult.errorMessage = error.message;

    await websocketService.notifyTestStepCompleted(testCaseRunId, testSuiteRunId, stepResult.stepNumber, {
      error: error.message
    });

    results.push(stepResult);
  }

  private getStatementDescription(statement: any): string {
    // Generate a human-readable description of the statement for logging
    if (statement.constructor.name === 'GoStmt') {
      return `go ${statement.action}${statement.target ? ` to ${statement.target}` : ''}`;
    } else if (statement.constructor.name === 'ClickStmt') {
      return `click ${statement.selector}`;
    } else if (statement.constructor.name === 'TypeStmt') {
      return `type ${statement.value} into ${statement.selector}`;
    } else if (statement.constructor.name === 'WaitStmt') {
      if (statement.type === 'time') {
        return `wait for ${statement.value} seconds`;
      } else if (statement.type === 'element') {
        return `wait for ${statement.selector} to ${statement.condition}`;
      } else if (statement.type === 'page') {
        return 'wait for page to load';
      }
    } else if (statement.constructor.name === 'ExpectStmt') {
      return `expect ${statement.type} ${statement.target || ''} ${statement.operator} ${statement.expected || statement.state}`;
    } else if (statement.constructor.name === 'CallStmt') {
      return `call ${statement.functionName}${statement.args.length > 0 ? ` with ${statement.args.join(', ')}` : ''}`;
    } else if (statement.constructor.name === 'SetStmt') {
      return `set ${statement.target} to ${statement.value}`;
    } else if (statement.constructor.name === 'PrintStmt') {
      return `print ${statement.value}`;
    } else if (statement.constructor.name === 'IfStmt') {
      return 'if statement';
    } else if (statement.constructor.name === 'ForEachStmt') {
      return `for each ${statement.variable} in ${statement.collection}`;
    } else if (statement.constructor.name === 'RepeatStmt') {
      return `repeat ${statement.count} times`;
    } else if (statement.constructor.name === 'FunctionStmt') {
      return `define function ${statement.name}`;
    }

    return statement.constructor.name || 'unknown statement';
  }

  private async applySetupState(page: Page, setupState: SetupState): Promise<void> {
    if (setupState.cookies) {
      await page.context().addCookies(setupState.cookies);
    }

    if (setupState.localStorage) {
      await page.evaluate((localStorage) => {
        for (const [key, value] of Object.entries(localStorage)) {
          // window.localStorage.setItem(key, value);
        }
      }, setupState.localStorage);
    }

    if (setupState.sessionStorage) {
      await page.evaluate((sessionStorage) => {
        for (const [key, value] of Object.entries(sessionStorage)) {
          // window.sessionStorage.setItem(key, value);
        }
      }, setupState.sessionStorage);
    }

    if (setupState.url) {
      await page.goto(setupState.url);
    }
  }

  setVariables(
    projectVariablesHash: Map<string, any>,
    testSuiteVariablesHash: Map<string, any>
  ): void {
    this.projectVariablesHash = new Map(projectVariablesHash);
    this.testSuiteVariablesHash = new Map(testSuiteVariablesHash);
  }

  setFunctions(
    projectFunctionsHash: Map<string, any>,
    testSuiteFunctionsHash: Map<string, any>
  ): void {
    this.projectFunctionsHash = new Map(projectFunctionsHash);
    this.testSuiteFunctionsHash = new Map(testSuiteFunctionsHash);
  }

  private async captureScreenshot(
    page: Page,
    stepNumber: number,
    testCaseRunId: string
  ): Promise<string> {
    const screenshot = await page.screenshot({ type: 'png' });
    const timestamp = Date.now();
    const filename = `test-case-${testCaseRunId}-step-${stepNumber}-${timestamp}.png`;

    // Upload directly to MinIO
    const uploadResult = await minioService.uploadScreenshot(screenshot, filename);

    return uploadResult.url;
  }

  private async captureErrorScreenshot(
    page: Page | undefined,
    testCaseRunId: string
  ): Promise<string | null> {
    try {
      if (page) {
        const screenshot = await page.screenshot({ type: 'png' });
        const timestamp = Date.now();
        const filename = `test-case-${testCaseRunId}-error-${timestamp}.png`;

        // Upload directly to MinIO
        const uploadResult = await minioService.uploadScreenshot(screenshot, filename);
        return uploadResult.url;
      }
    } catch (error) {
      console.error('Failed to capture error screenshot:', (error as Error).message);
    }
    return null;
  }
}

export default new ExecutionService();
