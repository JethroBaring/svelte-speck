<script lang="ts">
	interface RadioProps {
		id: string; // Unique ID for the radio button
		name: string; // Radio group name
		value: string; // Value of the radio button
		checked: boolean; // Whether the radio button is checked
		label: string; // Label for the radio button
		onChange: (value: string) => void; // Handler for value change
		className?: string; // Optional additional classes
		disabled?: boolean; // Optional disabled state for the radio button
	}

	const {
		id,
		name,
		value,
		checked,
		label,
		onChange,
		className = '',
		disabled = false
	}: RadioProps = $props();
</script>

<label
	for={id}
	class="relative flex cursor-pointer items-center gap-3 text-sm font-medium select-none {disabled
		? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
		: 'text-gray-700 dark:text-gray-400'} {className}"
>
	<input
		{id}
		{name}
		type="radio"
		{value}
		{checked}
		onchange={() => !disabled && onChange(value)}
		class="sr-only"
		{disabled}
	/>
	<span
		class="flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] {checked
			? 'border-brand-500 bg-brand-500'
			: 'border-gray-300 bg-transparent dark:border-gray-700'} {disabled
			? 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700'
			: ''}"
	>
		<span class="h-2 w-2 rounded-full bg-white {checked ? 'block' : 'hidden'}"></span>
	</span>
	{label}
</label>
