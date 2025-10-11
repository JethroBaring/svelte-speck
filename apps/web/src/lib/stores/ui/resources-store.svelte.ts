import type { ProjectFunction, ProjectVariable, TestSuiteFunction, TestSuiteVariable, Workspace } from '@repo/types/zod';
import { getContext, setContext } from 'svelte';

export class ResourcesStore {
	projectVariables = $state<ProjectVariable[]>([]);
	testSuiteVariables = $state<TestSuiteVariable[]>([]);
	projectFunctions = $state<ProjectFunction[]>([]);
	testSuiteFunctions = $state<TestSuiteFunction[]>([]);
	selectedProjectVariable = $state<Workspace | null>(null);
	selectedTestSuiteVariable = $state<Workspace | null>(null);
	selectedProjectFunction = $state<Workspace | null>(null);
	selectedTestSuiteFunction = $state<Workspace | null>(null);

	constructor(projectVariables: ProjectVariable[] = [], testSuiteVariables: TestSuiteVariable[] = [], projectFunctions: ProjectFunction[] = [], testSuiteFunctions: TestSuiteFunction[] = []) {
		this.projectVariables = projectVariables;
		this.testSuiteVariables = testSuiteVariables;
		this.projectFunctions = projectFunctions;
		this.testSuiteFunctions = testSuiteFunctions;
	}

	updateProjectVariables(projectVariables: ProjectVariable[]) {
		this.projectVariables = projectVariables;
	}

	updateTestSuiteVariables(testSuiteVariables: TestSuiteVariable[]) {
		this.testSuiteVariables = testSuiteVariables;
	}

	updateProjectFunctions(projectFunctions: ProjectFunction[]) {
		this.projectFunctions = projectFunctions;
	}

	updateTestSuiteFunctions(testSuiteFunctions: TestSuiteFunction[]) {
		this.testSuiteFunctions = testSuiteFunctions;
	}

	getVariablesKeywords() {
		return [...this.projectVariables.map((v) => v.name), ...this.testSuiteVariables.map((v) => v.name)];
	}

	getFunctionsKeywords() {
		return [...this.projectFunctions.map((f) => f.name), ...this.testSuiteFunctions.map((f) => f.name)];
	}
}

const RESOURCES_KEY = Symbol('resources');

export function setResourcesStore(projectVariables: ProjectVariable[] = [], testSuiteVariables: TestSuiteVariable[] = [], projectFunctions: ProjectFunction[] = [], testSuiteFunctions: TestSuiteFunction[] = []) {
	return setContext(RESOURCES_KEY, new ResourcesStore(projectVariables, testSuiteVariables, projectFunctions, testSuiteFunctions));
}

export function getResourcesStore() {
	return getContext<ResourcesStore>(RESOURCES_KEY);
}
