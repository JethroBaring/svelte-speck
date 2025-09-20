<script lang="ts">
	interface Props {
		size?: 'sm' | 'md';
		variant?: 'primary' | 'outline';
		startIcon?: any;
		endIcon?: any;
		onClick?: () => void;
		className?: string;
		disabled?: boolean;
		children?: any;
	}

	let {
		size = 'md',
		variant = 'primary',
		startIcon,
		endIcon,
		onClick,
		className = '',
		disabled = false,
		children
	}: Props = $props();

	const sizeClasses = {
		sm: 'px-4 py-3 text-sm',
		md: 'px-5 py-3.5 text-sm'
	};

	const variantClasses = {
		primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
		outline:
			'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300'
	};

	const handleClick = () => {
		if (!disabled && onClick) {
			onClick();
		}
	};
</script>

<button
	class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition {sizeClasses[
		size
	]} {variantClasses[variant]} {className}"
	class:cursor-not-allowed={disabled}
	class:opacity-50={disabled}
	onclick={handleClick}
	{disabled}
>
	{#if startIcon}
		<span class="flex items-center">
			{@render icon(startIcon)}
		</span>
	{/if}
	{@render children?.()}
	{#if endIcon}
		<span class="flex items-center">
			{@render icon(endIcon)}
		</span>
	{/if}
</button>

{#snippet icon(icon: any)}
	{@const Icon = icon}
	<Icon />
{/snippet}
