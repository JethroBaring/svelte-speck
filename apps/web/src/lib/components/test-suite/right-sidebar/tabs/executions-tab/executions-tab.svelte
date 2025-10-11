<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	// import TestCaseCard from "./test-case-card.svelte";
</script>

<div class="test-sm flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<p>Executions</p>
		<button
			class="flex size-6 items-center justify-center rounded-full hover:bg-gray-800 active:bg-gray-800"
		>
			<PlusIcon class="size-4" />
		</button>
	</div>
	{#each Array(10) as item}
		<!-- <TestCaseCard /> -->
	{/each}
</div>
