import { chromium, Browser, Page } from 'playwright';

interface JobData {
  testSuiteRunId: string;
  cacheKey: string;
  setupSteps: SetupStep[];
}

interface SetupStep {
  type: 'navigate' | 'login' | 'wait' | 'click' | 'type';
  url?: string;
  loginData?: LoginData;
  duration?: number;
  selector?: string;
  value?: string;
}

interface LoginData {
  loginUrl?: string;
  usernameSelector?: string;
  username?: string;
  passwordSelector?: string;
  password?: string;
  submitSelector?: string;
  successIndicator?: string;
}

interface SetupState {
  cookies: any[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  url: string;
  timestamp: string;
}

interface SetupResult {
  success: boolean;
  setupState?: SetupState;
  duration: number;
  error?: string;
}

class SetupService {
  constructor() {
    // Setup-specific configuration can be added here
  }

  async runSetup(jobData: JobData): Promise<SetupResult> {
    const { testSuiteRunId, cacheKey, setupSteps } = jobData;
    const startTime = Date.now();
    let browser: Browser | undefined;

    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage();

      // Perform setup steps
      await this.performSetupSteps(page, setupSteps);

      // Capture setup state
      const setupState = await this.captureSetupState(page);

      // Cache setup data
      await this.cacheSetupData(cacheKey, setupState);

      // Notify completion
      await this.notifySetupCompleted(testSuiteRunId, cacheKey, setupState);

      const duration = Date.now() - startTime;
      console.log("✅ Setup completed successfully");
      return {
        success: true,
        setupState,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("❌ Setup failed:", (error as Error).message);

      // Notify failure
      await this.notifySetupFailed(testSuiteRunId, cacheKey, (error as Error).message);

      return {
        success: false,
        error: (error as Error).message,
        duration,
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
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });
  }

  private async performSetupSteps(page: Page, setupSteps: SetupStep[]): Promise<void> {
    if (!setupSteps || setupSteps.length === 0) {
      console.log("ℹ️ No setup steps to perform");
      return;
    }

    console.log(`📝 Performing ${setupSteps.length} setup steps`);

    for (let i = 0; i < setupSteps.length; i++) {
      const step = setupSteps[i];
      console.log(`⚡ Setup step ${i + 1}: ${step.type}`);

      await this.executeSetupStep(page, step);
    }
  }

  private async executeSetupStep(page: Page, step: SetupStep): Promise<void> {
    switch (step.type) {
      case "navigate":
        if (step.url) {
          await page.goto(step.url);
        }
        break;
      case "login":
        if (step.loginData) {
          await this.performLoginSteps(page, step.loginData);
        }
        break;
      case "wait":
        await page.waitForTimeout(step.duration || 1000);
        break;
      case "click":
        if (step.selector) {
          await page.click(step.selector);
        }
        break;
      case "type":
        if (step.selector && step.value) {
          await page.fill(step.selector, step.value);
        }
        break;
      default:
        throw new Error(`Unknown setup step type: ${step.type}`);
    }
  }

  private async performLoginSteps(page: Page, loginData: LoginData): Promise<void> {
    // Navigate to login page
    if (loginData.loginUrl) {
      await page.goto(loginData.loginUrl);
    }

    // Fill credentials
    if (loginData.usernameSelector && loginData.username) {
      await page.fill(loginData.usernameSelector, loginData.username);
    }

    if (loginData.passwordSelector && loginData.password) {
      await page.fill(loginData.passwordSelector, loginData.password);
    }

    // Submit form
    if (loginData.submitSelector) {
      await page.click(loginData.submitSelector);
    }

    // Wait for success (you might want to wait for a specific element or URL)
    if (loginData.successIndicator) {
      await page.waitForSelector(loginData.successIndicator, { timeout: 10000 });
    }
  }

  private async captureSetupState(page: Page): Promise<SetupState> {
    const [cookies, localStorage, sessionStorage, url] = await Promise.all([
      page.context().cookies(),
      page.evaluate(() => {
        const storage: Record<string, string> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            storage[key] = window.localStorage.getItem(key) || '';
          }
        }
        return storage;
      }),
      page.evaluate(() => {
        const storage: Record<string, string> = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
            storage[key] = window.sessionStorage.getItem(key) || '';
          }
        }
        return storage;
      }),
      page.url(),
    ]);

    return {
      cookies,
      localStorage,
      sessionStorage,
      url,
      timestamp: new Date().toISOString(),
    };
  }

  private async cacheSetupData(cacheKey: string, setupData: SetupState): Promise<void> {
    // This would typically store the setup data in Redis or another cache
    // For now, we'll just log it
    console.log(`💾 Caching setup data for key: ${cacheKey}`);
    // TODO: Implement actual caching mechanism
  }

  private async notifySetupCompleted(testSuiteRunId: string, cacheKey: string, setupData: SetupState): Promise<void> {
    // This would typically make an API call to notify completion
    console.log(`✅ Setup completed for test suite ${testSuiteRunId} with cache key ${cacheKey}`);
    // TODO: Implement actual notification mechanism
  }

  private async notifySetupFailed(testSuiteRunId: string, cacheKey: string, error: string): Promise<void> {
    // This would typically make an API call to notify failure
    console.log(`❌ Setup failed for test suite ${testSuiteRunId} with cache key ${cacheKey}: ${error}`);
    // TODO: Implement actual notification mechanism
  }
}

export default new SetupService();
