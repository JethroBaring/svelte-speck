<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Folder from '@lucide/svelte/icons/folder';
	import PlusCircleIcon from '@lucide/svelte/icons/plus-circle';
	import { getProjectsStore } from '$lib/stores/ui/projects-store.svelte';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { CREATE_PROJECT_MODAL_KEY } from '$lib/constants/modal-keys';

	const projectsStore = getProjectsStore();
	const modalStore = getModalStore(CREATE_PROJECT_MODAL_KEY);
</script>

{#if projectsStore.isLoading}
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
{:else if projectsStore.projects.length === 0}
	<div class="flex h-full">
		<div class="flex flex-1 flex-col">
			<div class="flex flex-1 items-center justify-center">
				<div class="mx-auto max-w-md px-4 text-center">
					<div
						class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
					>
						<Folder class="h-10 w-10 text-gray-400 dark:text-gray-500" />
					</div>

					<h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
						Welcome to Speck!
					</h2>

					<p class="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
						Get started by creating your first testing project. Organize your test suites, manage
						test cases, and track execution results all in one place.
					</p>

					<div class="space-y-3">
						<Button class="w-full" onclick={() => modalStore.open()}>
							<PlusCircleIcon class="mr-2 h-5 w-5" />
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
						class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
					>
						<Folder class="h-10 w-10 text-gray-400 dark:text-gray-500" />
					</div>

					<h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
						No Project Selected
					</h2>

					<p class="mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
						You have {projectsStore.projects.length} project available. Select a project from the sidebar
						to get started, or create a new one.
					</p>

					<div class="space-y-3">
						<Button class="w-full" onclick={() => modalStore.open()}>
							<PlusCircleIcon class="mr-2 h-5 w-5" />
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
