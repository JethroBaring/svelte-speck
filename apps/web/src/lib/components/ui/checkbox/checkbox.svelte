<script lang="ts">
	interface CheckboxProps {
		label?: string;
		checked: boolean;
		className?: string;
		id?: string;
		onChange: (checked: boolean) => void;
		disabled?: boolean;
	}

	const { label, checked, className, id, onChange, disabled }: CheckboxProps = $props();
</script>

<label
	class="group flex cursor-pointer items-center space-x-3 {disabled
		? 'cursor-not-allowed opacity-60'
		: ''}"
>
	<div class="relative h-5 w-5">
		<input
			{id}
			type="checkbox"
			class={`h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-transparent checked:bg-brand-500 disabled:opacity-60 dark:border-gray-700 
          ${className}`}
			{checked}
			onchange={(e) => onChange((e.target as HTMLInputElement).checked)}
			onclick={(e) => e.stopPropagation()}
			{disabled}
		/>
		{#if checked}
			<svg
				class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 14 14"
				fill="none"
			>
				<path
					d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
					stroke="white"
					stroke-width="1.94437"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
		{#if disabled}
			<svg
				class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 14 14"
				fill="none"
			>
				<path
					d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
					stroke="#E4E7EC"
					stroke-width="2.33333"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
	</div>
	{#if label}
		<span class="text-sm font-medium text-gray-800 dark:text-gray-200">
			{label}
		</span>
	{/if}
</label>
