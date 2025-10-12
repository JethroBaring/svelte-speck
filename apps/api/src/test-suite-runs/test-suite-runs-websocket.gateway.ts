// src/test-suite-runs/test-suite-runs-websocket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { TestSuiteRunsService } from './test-suite-runs.service';
import { TestSuiteRunsEventsService } from './test-suite-runs-events.service';
import { WebSocketUtilsService } from '../common/websocket';

export interface TestProgressData {
  testSuiteRunId: string;
  testCaseRunId?: string;
  status: string;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  testCase?: {
    name: string;
    duration?: number;
    errorMessage?: string;
  };
  testStep?: {
    stepNumber: number;
    status: string;
    error?: string;
    screenshotUrl?: string;
  };
  timestamp: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/test-suite-runs',
})
export class TestSuiteRunsWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TestSuiteRunsWebSocketGateway.name);

  constructor(
    private testSuiteRunsService: TestSuiteRunsService,
    private testEventsService: TestSuiteRunsEventsService,
    private wsUtils: WebSocketUtilsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.testEventsService.setWebSocketGateway(this);
    this.logger.log('TestSuiteRunsEventsService gateway wiring completed');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.wsUtils.leaveAllRooms(client);
  }

  @SubscribeMessage('join-test-suite-run')
  async handleJoinTestSuiteRun(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { testSuiteRunId: string },
  ) {
    const room = `test-suite-${data.testSuiteRunId}`;
    
    const joined = await this.wsUtils.joinRoom(client, room, {
      testSuiteRunId: data.testSuiteRunId,
    });

    if (!joined) {
      this.wsUtils.sendError(client, 'Failed to join room', 'JOIN_FAILED');
      return;
    }

    // Send current status to the newly joined client
    const status = await this.testSuiteRunsService.getTestSuiteRunStatus(
      data.testSuiteRunId,
    );
    
    if (status) {
      this.wsUtils.emitToClient(client, 'test-suite-status', {
        type: 'current-status',
        data: status,
      });

      // If the suite is already running, emit a started event so the client doesn't miss it
      if (status.status === 'RUNNING') {
        this.wsUtils.emitToClient(client, 'test-suite-started', {
          testSuiteRunId: status.testSuiteRunId,
          status: status.status,
          progress: status.progress,
        });
      }
    }

    this.wsUtils.emitToClient(client, 'joined-room', {
      testSuiteRunId: data.testSuiteRunId,
      room,
    });
  }

  @SubscribeMessage('leave-test-suite-run')
  async handleLeaveTestSuiteRun(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { testSuiteRunId: string },
  ) {
    const room = `test-suite-${data.testSuiteRunId}`;
    await this.wsUtils.leaveRoom(client, room);
  }

  @SubscribeMessage('cancel-test-suite')
  async handleCancelTestSuite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { testSuiteRunId: string },
  ) {
    try {
      await this.testSuiteRunsService.cancelTestSuiteRunRealtime(
        data.testSuiteRunId,
      );

      const room = `test-suite-${data.testSuiteRunId}`;
      
      this.wsUtils.emitToRoom(this.server, room, 'test-suite-cancelled', {
        testSuiteRunId: data.testSuiteRunId,
        cancelledBy: client.id,
      });

      this.wsUtils.emitToClient(client, 'cancel-success', {
        testSuiteRunId: data.testSuiteRunId,
      });
    } catch (error) {
      this.wsUtils.sendError(
        client,
        error,
        'CANCEL_FAILED',
        { testSuiteRunId: data.testSuiteRunId },
      );
    }
  }

  @SubscribeMessage('cancel-test-case')
  async handleCancelTestCase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { testCaseRunId: string; testSuiteRunId: string },
  ) {
    try {
      await this.testSuiteRunsService.cancelTestCaseRealtime(data.testCaseRunId);

      const room = `test-suite-${data.testSuiteRunId}`;
      
      this.wsUtils.emitToRoom(this.server, room, 'test-case-cancelled', {
        testCaseRunId: data.testCaseRunId,
        testSuiteRunId: data.testSuiteRunId,
        cancelledBy: client.id,
      });
    } catch (error) {
      this.wsUtils.sendError(
        client,
        error,
        'CANCEL_TEST_CASE_FAILED',
        { testCaseRunId: data.testCaseRunId },
      );
    }
  }

  @SubscribeMessage('retry-test-case')
  async handleRetryTestCase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { testCaseRunId: string; testSuiteRunId: string },
  ) {
    try {
      const job = await this.testSuiteRunsService.retryTestCase(data.testCaseRunId);

      const room = `test-suite-${data.testSuiteRunId}`;
      
      this.wsUtils.emitToRoom(this.server, room, 'test-case-retried', {
        testCaseRunId: data.testCaseRunId,
        testSuiteRunId: data.testSuiteRunId,
        jobId: job.id,
        retriedBy: client.id,
      });
    } catch (error) {
      this.wsUtils.sendError(
        client,
        error,
        'RETRY_FAILED',
        { testCaseRunId: data.testCaseRunId },
      );
    }
  }

  // Methods called by the queue service to emit events
  emitTestSuiteStarted(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'test-suite-started', data);
  }

  emitSetupCompleted(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'setup-completed', data);
  }

  emitSetupFailed(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'setup-failed', data);
  }

  emitTestCaseStarted(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'test-case-started', data);
  }

  emitTestCaseCompleted(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'test-case-completed', data);
  }

  emitTestStepStarted(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'test-step-started', data);
  }

  emitTestStepCompleted(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'test-step-completed', data);
  }

  emitTestSuiteCompleted(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'test-suite-completed', data);
  }

  emitProgressUpdate(data: TestProgressData) {
    const room = `test-suite-${data.testSuiteRunId}`;
    this.wsUtils.emitToRoom(this.server, room, 'progress-update', data);
  }

  emitError(testSuiteRunId: string, error: any) {
    const room = `test-suite-${testSuiteRunId}`;
    this.wsUtils.sendErrorToRoom(this.server, room, error, 'TEST_ERROR', {
      testSuiteRunId,
    });
  }
}
