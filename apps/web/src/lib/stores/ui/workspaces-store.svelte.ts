import type { Workspace } from '@repo/types/zod';
import { getContext, setContext } from 'svelte';

export class WorkspacesStore {
	workspaces = $state<Workspace[]>([]);
	selectedWorkspace = $state<Workspace | null>(null);

	constructor(workspaces: Workspace[] = []) {
		this.workspaces = workspaces;
	}

	setSelectedWorkspace(workspace: Workspace) {
		this.selectedWorkspace = workspace;
	}

	updateWorkspaces(workspaces: Workspace[]) {
		this.workspaces = workspaces;
	}

	addWorkspace(workspace: Workspace) {
		this.workspaces = [...this.workspaces, workspace];
	}

	removeWorkspace(workspaceId: string) {
		this.workspaces = this.workspaces.filter(w => w.id !== workspaceId);
	}
}

const WORKSPACES_KEY = Symbol('workspaces');

export function setWorkspacesStore(workspaces: Workspace[]) {
	return setContext(WORKSPACES_KEY, new WorkspacesStore(workspaces));
}

export function getWorkspacesStore() {
	return getContext<WorkspacesStore>(WORKSPACES_KEY);
}
