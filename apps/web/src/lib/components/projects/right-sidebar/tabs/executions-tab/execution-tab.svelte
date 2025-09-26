<script lang="ts">
	import { Card } from '@/lib/components/ui/card';
	import { Clock } from 'lucide-svelte';
	import { TestStatusIcon } from '@/lib/components/common';

	const executions = [
		{ id: 1, name: 'Test Suite 1', status: 'passed', duration: '2m 34s', timestamp: '2 hours ago' },
		{ id: 2, name: 'Test Suite 2', status: 'failed', duration: '1m 45s', timestamp: '4 hours ago' },
		{ id: 3, name: 'Test Suite 3', status: 'passed', duration: '3m 12s', timestamp: '1 day ago' }
	];
</script>

<div class="space-y-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="font-medium text-gray-900 dark:text-white">Execution History</h3>
	</div>
	<div class="space-y-3">
		{#each executions as execution}
			<Card className="p-4">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-gray-900 dark:text-white">{execution.name}</span>
					<TestStatusIcon
						status={execution.status as 'passed' | 'failed' | 'skipped' | 'in_progress' | 'pending'}
					/>
				</div>
				<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
					<span class="flex items-center gap-1">
						<Clock class="h-3 w-3" />
						{execution.duration}
					</span>
					<span>{execution.timestamp}</span>
				</div>
			</Card>
		{/each}
	</div>
</div>
