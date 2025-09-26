<script lang="ts">
	import { CheckCircle, XCircle, Clock } from 'lucide-svelte';

	interface StatusIconProps {
		status: 'passed' | 'failed' | 'skipped' | 'in_progress' | 'pending';
	}

	let { status }: StatusIconProps = $props();
</script>

{#if status === 'passed'}
	<CheckCircle class="h-4 w-4 text-green-500" />
{:else if status === 'failed'}
	<XCircle class="h-4 w-4 text-red-500" />
{:else}
	<Clock class="h-4 w-4 text-yellow-500" />
{/if}
