// src/test-runner/test-events.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis';
import { TestSuiteRunsWebSocketGateway } from './test-suite-runs-websocket.gateway';

export interface RedisTestEvent {
  type:
    | 'test-suite-started'
    | 'setup-completed'
    | 'setup-failed'
    | 'test-case-started'
    | 'test-case-completed'
    | 'test-suite-completed'
    | 'test-suite-cancelled'
    | 'test-case-cancelled'
    | 'test-step-started'
    | 'test-step-completed';
  testSuiteRunId: string;
  testCaseRunId?: string;
  data: any;
  timestamp: string;
}

export interface CancellationEvent {
  type: 'cancel-suite' | 'cancel-test-case';
  testSuiteRunId: string;
  testCaseRunId?: string;
  timestamp: string;
}

/**
 * Service responsible for test-specific Redis operations.
 * Handles publishing and subscribing to test execution events.
 */
@Injectable()
export class TestSuiteRunsEventsService implements OnModuleInit {
  private readonly logger = new Logger(TestSuiteRunsEventsService.name);
  private webSocketGateway: TestSuiteRunsWebSocketGateway;

  // Channel names
  private readonly TEST_SUITE_CHANNEL = 'test-suite-events';
  private readonly TEST_CASE_CHANNEL = 'test-case-events';
  private readonly TEST_STEP_CHANNEL = 'test-step-events';
  private readonly SETUP_CHANNEL = 'setup-events';
  private readonly CANCELLATION_CHANNEL = 'cancellation-events';

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    // Subscribe to all test-related channels
    await this.redisService.subscribe([
      this.TEST_SUITE_CHANNEL,
      this.TEST_CASE_CHANNEL,
      this.TEST_STEP_CHANNEL,
      this.SETUP_CHANNEL,
      this.CANCELLATION_CHANNEL,
    ]);

    // Register message handler
    this.redisService.registerMessageHandler(
      this.handleTestMessage.bind(this),
      [
        this.TEST_SUITE_CHANNEL,
        this.TEST_CASE_CHANNEL,
        this.TEST_STEP_CHANNEL,
        this.SETUP_CHANNEL,
        this.CANCELLATION_CHANNEL,
      ],
    );

    this.logger.log('Test events service initialized');
  }

  /**
   * Set the WebSocket gateway for emitting events to connected clients
   */
  setWebSocketGateway(gateway: TestSuiteRunsWebSocketGateway): void {
    this.webSocketGateway = gateway;
  }

  // ============ Publishing Methods ============

  async publishTestSuiteEvent(event: RedisTestEvent): Promise<void> {
    await this.redisService.publish(this.TEST_SUITE_CHANNEL, event);
  }

  async publishTestCaseEvent(event: RedisTestEvent): Promise<void> {
    await this.redisService.publish(this.TEST_CASE_CHANNEL, event);
  }

  async publishTestStepEvent(event: RedisTestEvent): Promise<void> {
    await this.redisService.publish(this.TEST_STEP_CHANNEL, event);
  }

  async publishSetupEvent(event: RedisTestEvent): Promise<void> {
    await this.redisService.publish(this.SETUP_CHANNEL, event);
  }

  async publishCancellationEvent(event: CancellationEvent): Promise<void> {
    await this.redisService.publish(this.CANCELLATION_CHANNEL, event);
  }

  // ============ Message Handler ============

  private async handleTestMessage(channel: string, message: string): Promise<void> {
    if (!this.webSocketGateway) {
      this.logger.warn(
        `TestSuiteRunsEventsService received message but WebSocketGateway is not set. Channel: ${channel}`,
      );
      return;
    }

    try {
      const event = JSON.parse(message);

      switch (channel) {
        case this.TEST_SUITE_CHANNEL:
          this.handleTestSuiteEvent(event);
          break;
        case this.TEST_CASE_CHANNEL:
          this.handleTestCaseEvent(event);
          break;
        case this.TEST_STEP_CHANNEL:
          this.handleTestStepEvent(event);
          break;
        case this.SETUP_CHANNEL:
          this.handleSetupEvent(event);
          break;
        case this.CANCELLATION_CHANNEL:
          // Cancellation events are handled by the queue service
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling test message on channel ${channel}:`, error);
    }
  }

  // ============ Event Handlers ============

  private handleTestSuiteEvent(event: RedisTestEvent): void {
    const progressData = {
      testSuiteRunId: event.testSuiteRunId,
      status: event.data.status,
      progress: event.data.progress,
      timestamp: event.timestamp,
    };

    switch (event.type) {
      case 'test-suite-started':
        this.webSocketGateway.emitTestSuiteStarted(progressData);
        break;
      case 'test-suite-completed':
        this.webSocketGateway.emitTestSuiteCompleted(progressData);
        break;
      case 'test-suite-cancelled':
        // Handle suite cancellation if needed
        break;
    }
  }

  private handleTestCaseEvent(event: RedisTestEvent): void {
    const progressData = {
      testSuiteRunId: event.testSuiteRunId,
      testCaseRunId: event.testCaseRunId,
      status: event.data.status,
      progress: event.data.progress,
      testCase: event.data.testCase,
      timestamp: event.timestamp,
    };

    switch (event.type) {
      case 'test-case-started':
        this.webSocketGateway.emitTestCaseStarted(progressData);
        break;
      case 'test-case-completed':
        this.webSocketGateway.emitTestCaseCompleted(progressData);
        break;
    }
  }

  private handleTestStepEvent(event: RedisTestEvent): void {
    const progressData = {
      testSuiteRunId: event.testSuiteRunId,
      testCaseRunId: event.testCaseRunId,
      status: event.data.status,
      testStep: {
        stepNumber: event.data.stepNumber,
        status: event.data.status,
        error: event.data.error,
        screenshotUrl: event.data.screenshotUrl,
      },
      timestamp: event.timestamp,
    };

    switch (event.type) {
      case 'test-step-started':
        this.webSocketGateway.emitTestStepStarted(progressData);
        break;
      case 'test-step-completed':
        this.webSocketGateway.emitTestStepCompleted(progressData);
        break;
    }
  }

  private handleSetupEvent(event: RedisTestEvent): void {
    const progressData = {
      testSuiteRunId: event.testSuiteRunId,
      status: event.data.status,
      progress: event.data.progress,
      timestamp: event.timestamp,
    };

    switch (event.type) {
      case 'setup-completed':
        this.webSocketGateway.emitSetupCompleted(progressData);
        break;
      case 'setup-failed':
        this.webSocketGateway.emitSetupFailed(progressData);
        break;
    }
  }

  // ============ Setup Data Cache Methods ============

  async cacheSetupData(cacheKey: string, data: any, ttlSeconds = 3600): Promise<void> {
    await this.redisService.set(cacheKey, data, ttlSeconds);
  }

  async getSetupData(cacheKey: string): Promise<any> {
    return await this.redisService.get(cacheKey);
  }

  async deleteSetupCache(cacheKey: string): Promise<void> {
    await this.redisService.delete(cacheKey);
  }

  async setSetupStatus(
    cacheKey: string,
    status: 'pending' | 'completed' | 'failed',
  ): Promise<void> {
    await this.redisService.set(`${cacheKey}:status`, status, 300); // 5 min TTL
  }

  async getSetupStatus(cacheKey: string): Promise<string | null> {
    return await this.redisService.get(`${cacheKey}:status`);
  }

  async setSetupData(cacheKey: string, data: any): Promise<void> {
    await this.redisService.set(`${cacheKey}:data`, data, 3600); // 1 hour TTL
  }

  async setSetupError(cacheKey: string, error: string): Promise<void> {
    await this.redisService.set(`${cacheKey}:error`, error, 3600); // 1 hour TTL
  }

  async getSetupError(cacheKey: string): Promise<string | null> {
    return await this.redisService.get(`${cacheKey}:error`);
  }

  // ============ Lock Methods ============

  /**
   * Acquire a distributed lock
   */
  async acquireLock(lockKey: string, ttlSeconds: number = 300): Promise<boolean> {
    return await this.redisService.acquireLock(lockKey, ttlSeconds);
  }

  /**
   * Release a distributed lock
   */
  async releaseLock(lockKey: string): Promise<void> {
    await this.redisService.releaseLock(lockKey);
  }
}

