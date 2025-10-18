import * as dotenv from 'dotenv';
dotenv.config();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

interface TestCaseResult {
  [key: string]: any;
}

class DatabaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MAIN_API_URL || 'http://localhost:3000';
  }

  private async _request(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<any> {
    const url = `${this.baseUrl}/worker${path}`;
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json', 
        'x-api-key': process.env.WORKER_API_KEY || '' 
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message = data?.message || `Request failed: ${res.status} ${res.statusText}`;
      const err = new Error(message) as Error & { status: number; data: any };
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  async updateTestCaseStarted(testCaseRunId: string): Promise<any> {
    return this._request(`/test-case-runs/${testCaseRunId}/start`, {
      method: 'PUT',
    });
  }

  async updateTestCaseCompleted(testCaseRunId: string, result: TestCaseResult): Promise<any> {
    return this._request(`/test-case-runs/${testCaseRunId}/complete`, {
      method: 'PUT',
      body: {
        ...result
      }
    });
  }
}

export default new DatabaseService();
