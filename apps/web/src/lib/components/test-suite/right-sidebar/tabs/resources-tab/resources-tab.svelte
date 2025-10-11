<script lang="ts">
	import FunctionsSection from './functions-section/functions-section.svelte';
	import VariablesSection from './variables-section/variables-section.svelte';
</script>

<div class="flex flex-col gap-4">
	<VariablesSection />

	<!-- No params for now, after AI Chat is implemented -->
	<FunctionsSection />
</div>
