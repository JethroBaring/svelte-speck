import type { Project } from '@repo/types/zod';
import { getContext, setContext } from 'svelte';

export class ProjectsStore {
	projects = $state<Project[]>([]);
	isLoading = $state(false);
	selectedProject = $state<Project | null>(null);

	constructor(projects: Project[] = []) {
		this.projects = projects;
	}

	setSelectedProject(project: Project) {
		this.selectedProject = project;
	}

	updateProjects(projects: Project[]) {
		this.projects = projects;
	}

	addProject(project: Project) {
		this.projects = [...this.projects, project];
	}

	removeProject(projectId: string) {
		this.projects = this.projects.filter((p) => p.id !== projectId);
	}

	setIsLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}
}

const PROJECTS_KEY = Symbol('projects');

export function setProjectsStore(projects: Project[]) {
	return setContext(PROJECTS_KEY, new ProjectsStore(projects));
}

export function getProjectsStore() {
	return getContext<ProjectsStore>(PROJECTS_KEY);
}
