// hooks/useUsers.ts
import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import {
	getOrganizations,
	createOrganization,
	getOrganizationMembers
} from '@/lib/api/organizations';

export function useOrganizations() {
	return createQuery(() => ({
		queryKey: ['organizations'],
		queryFn: () => getOrganizations(),
		enabled: true,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	}));
}

export function useCreateOrganization() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: createOrganization,
		onSuccess: (newProject) => {
			console.log('Project created successfully:', newProject);

			// Update the cache with the actual project data returned from the server
			queryClient.setQueryData(['organizations'], (old: any) => {
				console.log('Current cache data:', old);

				if (!old) return old;

				// Handle nested data structure (projects.data)
				if (old.data && Array.isArray(old.data)) {
					console.log('Updating nested data structure');
					const updated = {
						...old,
						data: [...old.data, newProject.data]
					};
					console.log('Updated cache:', updated);
					return updated;
				}

				console.log('No matching structure found, returning old data');
				return old;
			});

			// Also update the individual project cache if it exists
			queryClient.setQueryData(['organizations', newProject.data?.id], newProject.data);
		},
		onError: (err, newProjectName, context) => {
			// If the mutation fails, we could show an error toast here
			console.error('Failed to create project:', err);
		}
	}));
}

export function useOrganizationMembers(id: string) {
	return createQuery(() => ({
		queryKey: ['organization-members', id],
		queryFn: () => getOrganizationMembers(id)
	}));
}
