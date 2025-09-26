import { io, Socket } from "socket.io-client";
import { getContext, setContext } from 'svelte';

export class TestSuiteRunnerStore {
	socket: Socket | null = $state(null);
  isConnected: boolean = $state(false);
  status: 'idle' | 'running' | 'completed' | 'cancelled' = $state('idle');
  
	constructor() {
    this.socket = io('http://localhost:3000/test-runner', {
      transports: ['websocket'],
      autoConnect: false,
    })
    this.initialize();
  }

  initialize() {
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
  }

  private onConnect = () => {
    console.log('connected to test suite runner')
  }

  private onDisconnect = () => {
    console.log('disconnected from test suite runner')
  }

  private joinOrCreateRoom = (message: any) => {
    console.log('joined or created room', message)
  }

  
  private onTestSuiteStarted = (message: any) => {
    console.log('test suite started', message)
  }

  private onTestSuiteCompleted = (message: any) => {
    console.log('test suite completed', message)
  } 

  private onTestSuiteCancelled = (message: any) => {
    console.log('test suite cancelled', message)
  }

  private onTestCaseStarted = (message: any) => {
    console.log('test case started', message)
  }

  private onTestCaseCompleted = (message: any) => {
    console.log('test case completed', message)
  }

  private onTestCaseCancelled = (message: any) => {
    console.log('test case cancelled', message)
  }

  private onTestStepStarted = (message: any) => {
    console.log('test step started', message)
  }

  private onTestStepCompleted = (message: any) => {
    console.log('test step completed', message)
  }

  private onTestStepCancelled = (message: any) => {
    console.log('test step cancelled', message)
  }
  
}

const TEST_SUITE_RUNNER_KEY = Symbol('TEST_SUITE_RUNNER');

export function setTestSuiteRunnerStore() {
	return setContext(TEST_SUITE_RUNNER_KEY, new TestSuiteRunnerStore());
}

export function getTestSuiteRunnerStore() {
	return getContext<ReturnType<typeof setTestSuiteRunnerStore>>(TEST_SUITE_RUNNER_KEY);
}