import { io, Socket } from "socket.io-client";
import { getContext, setContext } from 'svelte';
import { getTestCasesStore, TestCasesStore } from "../ui/test-cases-store.svelte";
import type { TestSuiteRunStatusType } from "@repo/types/zod";

export class TestSuiteRunnerStore {
	socket: Socket | null = $state(null);
  isConnected: boolean = $state(false);
  status: TestSuiteRunStatusType = $state('PENDING');
  private initialized: boolean = false;
  private pendingJoinRunId: string | null = null;
  testCaseStore: TestCasesStore = getTestCasesStore()
  progress = $state({
    completed: 0,
    total: 0,
  })
  
	constructor() {
    this.socket = io('http://localhost:3000/test-suite-runs', {
      transports: ['websocket'],
      autoConnect: false,
    })
  }

  initialize() {
    if (this.initialized) {
      return; // Already initialized, don't do it again
    }
    
    this.socket?.on('connect', this.onConnect)
    this.socket?.on('disconnect', this.onDisconnect)
    this.socket?.on('test-suite-started', this.onTestSuiteStarted)
    this.socket?.on('test-suite-completed', this.onTestSuiteCompleted)
    this.socket?.on('test-suite-cancelled', this.onTestSuiteCancelled)
    this.socket?.on('test-case-started', this.onTestCaseStarted)
    this.socket?.on('test-case-completed', this.onTestCaseCompleted)
    this.socket?.on('test-case-cancelled', this.onTestCaseCancelled)
    this.socket?.on('test-step-started', this.onTestStepStarted)
    this.socket?.on('test-step-completed', this.onTestStepCompleted)
    this.socket?.on('test-step-cancelled', this.onTestStepCancelled)
    this.socket?.on('joined-room', this.onJoinedRoom)
    this.socket?.on('test-suite-status', this.onTestSuiteStatus)
    
    // Actually connect to the socket
    this.socket?.connect();
    
    this.initialized = true;
  }

  private onConnect = () => {
    console.log('connected to test suite runner')
    this.isConnected = true;
    if (this.pendingJoinRunId) {
      this.joinTestSuiteRun(this.pendingJoinRunId);
      this.pendingJoinRunId = null;
    }
  }

  private onDisconnect = () => {
    console.log('disconnected from test suite runner')
    this.isConnected = false;
  }

  private joinOrCreateRoom = (message: any) => {
    console.log('joined or created room', message)
  }

  
  private onTestSuiteStarted = (message: any) => {
    console.log('test suite started', message)
    this.status = 'RUNNING';
  }

  private onTestSuiteCompleted = (message: any) => {
    console.log('test suite completed', message)
    this.status = 'COMPLETED';
  } 

  private onTestSuiteCancelled = (message: any) => {
    console.log('test suite cancelled', message)
    this.status = 'CANCELLED';
  }

  private onTestCaseStarted = (message: any) => {
    console.log('test case started', message)
    this.testCaseStore.startTestCaseRun(message.data.testCaseRunId)
  }

  private onTestCaseCompleted = (message: any) => {
    console.log('test case completed', message)
    this.testCaseStore.completeTestCaseRun(message.data.testCaseRunId, message.data.status)
    this.progress.completed++;
  }

  private onTestCaseCancelled = (message: any) => {
    console.log('test case cancelled', message)
  }

  private onTestStepStarted = (message: any) => {
    this.testCaseStore.startTestStep(message.data.testCaseRunId, message.data.testStep)
    console.log('test step started', message)
  }

  private onTestStepCompleted = (message: any) => {
    console.log('test step completed', message)
    this.testCaseStore.completeTestStep(message.data.testCaseRunId, message.data.testStep)
  }

  private onTestStepCancelled = (message: any) => {
    console.log('test step cancelled', message)
    this.testCaseStore.cancelTestStep(message.data.testCaseRunId, message.data.testStep)
  }

  private onJoinedRoom = (message: any) => {
    console.log('joined room', message)
  }

  private onTestSuiteStatus = (message: any) => {
    console.log('test suite status', message)
    const status = message?.data?.status as string | undefined;
    if (status === 'RUNNING') {
      this.status = 'RUNNING';
    } else if (status === 'COMPLETED') {
      this.status = 'COMPLETED';
    } else if (status === 'CANCELLED') {
      this.status = 'CANCELLED';
    }
  }

  // Method to join a specific test suite run
  joinTestSuiteRun(testSuiteRunId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-test-suite-run', { testSuiteRunId });
    } else {
      console.warn('Socket not connected, deferring join for test suite run');
      this.pendingJoinRunId = testSuiteRunId;
      this.socket?.connect();
    }
  }

  // Method to leave a test suite run
  leaveTestSuiteRun(testSuiteRunId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-test-suite-run', { testSuiteRunId });
    }
  }
  
}

const TEST_SUITE_RUNNER_KEY = Symbol('TEST_SUITE_RUNNER');

export function setTestSuiteRunnerStore() {
	const existingStore = getContext<TestSuiteRunnerStore>(TEST_SUITE_RUNNER_KEY);
	if (existingStore) {
		return existingStore;
	}
	return setContext(TEST_SUITE_RUNNER_KEY, new TestSuiteRunnerStore());
}

export function getTestSuiteRunnerStore() {
	return getContext<ReturnType<typeof setTestSuiteRunnerStore>>(TEST_SUITE_RUNNER_KEY);
}