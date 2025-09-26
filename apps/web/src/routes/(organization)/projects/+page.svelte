<script lang="ts">
	import { Button } from '@/lib/components/ui/button';
	import { useProjects } from '@/lib/queries/use-projects';
	import { setModalStore, getModalStore } from "@/lib/stores/ui/modal-store.svelte";
	import { PROJECT_MODAL_KEY } from "@/lib/constants/modal-keys";
	import { Folder, PlusCircle } from 'lucide-svelte';

	const projectsQuery = useProjects();

	const hasProjects = $derived(($projectsQuery.data?.data?.length ?? 0) > 0);
	setModalStore(PROJECT_MODAL_KEY)

	const projectModalStore = getModalStore(PROJECT_MODAL_KEY);
</script>

<svelte:head>
	<title>Speck - Projects</title>
</svelte:head>

{#if $projectsQuery.isLoading}
	<div class="flex h-full">
		<div class="flex flex-1 flex-col">
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center">
					<div
						class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"
					></div>
					<p class="text-gray-600 dark:text-gray-400">Loading projects...</p>
				</div>
			</div>
		</div>
	</div>
{:else if hasProjects}
	<div class="flex h-full">
		<div class="flex flex-1 flex-col">
			<div class="flex flex-1 items-center justify-center">
				<div class="mx-auto max-w-md px-4 text-center">
					<div
						class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
					>
						<Folder class="h-12 w-12 text-gray-400 dark:text-gray-500" />
					</div>

					<h2 class="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
						Welcome to Speck!
					</h2>

					<p class="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
						Get started by creating your first testing project. Organize your test suites, manage
						test cases, and track execution results all in one place.
					</p>

					<div class="space-y-3">
						<Button size="xs" className="w-full" onClick={projectModalStore.openModal}>
							<PlusCircle class="mr-2 h-5 w-5" />
							Create Your First Project
						</Button>

						<p class="text-sm text-gray-500 dark:text-gray-400">
							Or explore our documentation to learn more
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex h-full">
		<div class="flex flex-1 flex-col">
			<div class="flex flex-1 items-center justify-center">
				<div class="mx-auto max-w-md px-4 text-center">
					<div
						class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
					>
						<Folder class="h-12 w-12 text-gray-400 dark:text-gray-500" />
					</div>

					<h2 class="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
						No Project Selected
					</h2>

					<p class="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
						You have {$projectsQuery.data?.data?.length} project{$projectsQuery.data?.data
							?.length !== 1
							? 's'
							: ''} available. Select a project from the sidebar to get started, or create a new one.
					</p>

					<div class="space-y-3">
						<Button size="xs" className="w-full" onClick={() => {}}>
							<PlusCircle class="mr-2 h-5 w-5" />
							Create New Project
						</Button>

						<p class="text-sm text-gray-500 dark:text-gray-400">
							Use the sidebar to navigate between projects
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
