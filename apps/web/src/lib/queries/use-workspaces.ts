// hooks/useUsers.ts
import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { getWorkspaces, createWorkspace, getWorkspaceMembers } from '$lib/api/workspaces';

export function useWorkspaces() {
	return createQuery(() => ({
		queryKey: ['workspaces'],
		queryFn: () => getWorkspaces(),
		enabled: true,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	}));
}

export function useCreateWorkspace() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: ({ name, icon }: { name: string; icon: string }) => createWorkspace(name, icon),
		onSuccess: (newWorkspace) => {
			console.log('Workspace created successfully:', newWorkspace);

			// Update the cache with the actual workspace data returned from the server
			queryClient.setQueryData(['workspaces'], (old: any) => {
				console.log('Current cache data:', old);

				if (!old) return old;

				// Handle nested data structure (workspaces.data)
				if (old.data && Array.isArray(old.data)) {
					console.log('Updating nested data structure');
					const updated = {
						...old,
						data: [...old.data, newWorkspace.data]
					};
					console.log('Updated cache:', updated);
					return updated;
				}

				console.log('No matching structure found, returning old data');
				return old;
			});

			// Also update the individual workspace cache if it exists
			queryClient.setQueryData(['workspaces', newWorkspace.data?.id], newWorkspace.data);
		},
		onError: (err, newWorkspaceName, context) => {
			// If the mutation fails, we could show an error toast here
			console.error('Failed to create workspace:', err);
		}
	}));
}

export function useWorkspaceMembers(id: string) {
	return createQuery(() => ({
		queryKey: ['workspace-members', id],
		queryFn: () => getWorkspaceMembers(id)
	}));
}
