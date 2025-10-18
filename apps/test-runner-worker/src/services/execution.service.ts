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
  step: number;
  command: string;
  screenshotUrl: string | null;
  status: TestStepStatus;
  error?: string;
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

  constructor() {
    this.projectVariablesHash = new Map();
    this.testSuiteVariablesHash = new Map();
    this.projectFunctionsHash = new Map();
    this.testSuiteFunctionsHash = new Map();
    this.environment = new Environment();
    this.interpreter = new Interpreter(this.environment, 'execute');
  }

  async executeTestCase(jobData: JobData): Promise<ExecutionResult> {
    const { code, setupState, testCaseRunId, testSuiteRunId } = jobData;
    const startTime = Date.now();
    let browser: Browser | undefined;
    let page: Page | undefined;
    const results: TestStepResult[] = [];

    try {
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

  private async executeTestCommands(
    page: Page,
    statements: any[],
    testCaseRunId: string,
    testSuiteRunId: string,
    results: TestStepResult[]
  ): Promise<TestStepResult[]> {
    console.log(`📝 Processing ${statements.length} statements`);

    let stepNumber = 1;

    for (const statement of statements) {
      const command = this.getStatementDescription(statement);
      console.log(`⚡ Step ${stepNumber}: ${command}`);

      try {
        await websocketService.notifyTestStepStarted(testCaseRunId, testSuiteRunId, stepNumber);

        // Execute the statement using the interpreter
        await this.interpreter.execute(statement);

        const screenshotUrl = await this.captureScreenshot(page, stepNumber, testCaseRunId);
        await websocketService.notifyTestStepCompleted(
          testCaseRunId,
          testSuiteRunId,
          stepNumber,
          {
            status: TestStepStatus.PASSED,
            screenshotUrl
          },
          screenshotUrl
        );
        results.push({
          step: stepNumber,
          command,
          screenshotUrl,
          status: TestStepStatus.PASSED
        });
      } catch (error) {
        console.error(`❌ Step ${stepNumber} failed:`, (error as Error).message);
        await websocketService.notifyTestStepCompleted(testCaseRunId, testSuiteRunId, stepNumber, {
          error: (error as Error).message
        });
        results.push({
          step: stepNumber,
          command,
          screenshotUrl: null,
          status: TestStepStatus.FAILED,
          error: (error as Error).message
        });
        // Continue executing remaining steps instead of failing fast
      }

      stepNumber++;
    }

    return results;
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
