<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface SelectProps {
		options: Option[];
		placeholder?: string;
		onChange?: (value: string) => void;
		className?: string;
		defaultValue?: string;
	}

	const { options, placeholder, onChange, className, defaultValue }: SelectProps = $props();

	let selectedValue = $state(defaultValue);

	const handleChange = (e: Event) => {
		const value = (e.target as HTMLSelectElement).value;
		selectedValue = value;
		onChange?.(value);
	};
</script>

<select
	class={`h-10 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
		selectedValue ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-400'
	} ${className}`}
	value={selectedValue}
	onchange={handleChange}
>
	<option value="" disabled class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
		{placeholder}
	</option>
	{#each options as option}
		<option value={option.value} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
			{option.label}
		</option>
	{/each}
</select>
