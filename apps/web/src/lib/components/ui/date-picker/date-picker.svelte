<script lang="ts">
	import flatpickr from 'flatpickr';
	import 'flatpickr/dist/flatpickr.css';
	import { Calendar } from 'lucide-svelte';
	import Label from '../label/label.svelte';
	import type { Hook } from 'flatpickr/dist/types/options';
	import type { DateOption } from 'flatpickr/dist/types/options';

	type PropsType = {
		id: string;
		mode?: 'single' | 'multiple' | 'range' | 'time';
		onChange?: Hook | Hook[];
		defaultDate?: DateOption;
		label?: string;
		placeholder?: string;
	};

	const { id, mode, onChange, defaultDate, label, placeholder }: PropsType = $props();
	$effect(() => {
		const flatPickr = flatpickr(`#${id}`, {
			mode: mode || 'single',
			static: true,
			monthSelectorType: 'static',
			dateFormat: 'Y-m-d',
			defaultDate,
			onChange
		});

		return () => {
			if (!Array.isArray(flatPickr)) {
				flatPickr.destroy();
			}
		};
	});
</script>

<div>
	{#if label}
		<Label htmlFor={id}>{label}</Label>
	{/if}
	<div class="relative">
		<input
			{id}
			{placeholder}
			class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
		/>

		<span
			class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400"
		>
			<Calendar class="size-6" />
		</span>
	</div>
</div>
