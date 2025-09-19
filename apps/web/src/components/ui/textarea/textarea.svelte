<script lang="ts">
	interface TextareaProps {
		placeholder?: string; // Placeholder text
		rows?: number; // Number of rows
		value?: string; // Current value
		onChange?: (value: string) => void; // Change handler
		className?: string; // Additional CSS classes
		disabled?: boolean; // Disabled state
		error?: boolean; // Error state
		hint?: string; // Hint text to display
	}

	const { placeholder, rows, value, onChange, className, disabled, error, hint }: TextareaProps =
		$props();

	const handleChange = (e: Event) => {
		if (onChange) {
			onChange((e.target as HTMLTextAreaElement).value);
		}
	};

	let textareaClasses = $state(
		`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className}`
	);

	if (disabled) {
		textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
	} else if (error) {
		textareaClasses += ` bg-transparent text-gray-400 border-gray-300 focus:border-error-300 focus:ring-3 focus:ring-error-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-error-800`;
	} else {
		textareaClasses += ` bg-transparent text-gray-400 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
	}
</script>

return (
<div class="relative">
	<textarea
		{placeholder}
		{rows}
		{value}
		onchange={handleChange}
		{disabled}
		class={textareaClasses}
	/>
	{#if hint}
		<p class={`mt-2 text-sm ${error ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'}`}>
			{hint}
		</p>
	{/if}
</div>
); }; export default TextArea;
