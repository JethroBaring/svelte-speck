<script lang="ts">
	import { Card } from '@/lib/components/ui/card';
	import { Folder } from 'lucide-svelte';

	const projects = [
		{ id: 'p1', name: 'Marketing Website', description: 'E2E tests for marketing site' },
		{ id: 'p2', name: 'Mobile App', description: 'Android/iOS smoke tests' },
		{ id: 'p3', name: 'Payments', description: 'Checkout and billing flows' },
		{ id: 'p4', name: 'Admin Portal', description: 'Access control and dashboards' }
	];
</script>

<div class="flex h-full">
	<div class="flex flex-1 items-center justify-center p-6">
		<div class="w-full max-w-5xl">
			<h1 class="mb-6 text-center text-xl font-semibold text-gray-900 dark:text-white">
				Projects
			</h1>
			<div class="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each projects as p}
					<a href="/projects/{p.id}">
						<Card className="p-5 hover:shadow-lg transition-shadow">
							<div class="flex items-start gap-3">
								<div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
									<Folder class="h-5 w-5 text-gray-500" />
								</div>
								<div>
									<h3 class="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
									<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{p.description}</p>
								</div>
							</div>
						</Card>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>


