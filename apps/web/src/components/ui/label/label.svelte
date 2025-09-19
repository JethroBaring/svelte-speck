<script lang="ts">
	import type { Snippet } from "svelte";

	interface LabelProps {
		htmlFor?: string;
		children: Snippet;
		className?: string;
	}

	const { htmlFor, children, className }: LabelProps = $props();
</script>

<label
	for={htmlFor}
	class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 {className}"
>
	{@render children?.()}
</label>
