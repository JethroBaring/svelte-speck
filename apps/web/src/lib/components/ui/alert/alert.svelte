<script lang="ts">
	// import { BadgeCheck } from 'lucide-svelte';
	import { BadgeCheck } from 'lucide-svelte';
	import { CircleX } from 'lucide-svelte';
	import { CircleAlert } from 'lucide-svelte';
	import { Info } from 'lucide-svelte';

	interface Props {
		variant: 'success' | 'error' | 'warning' | 'info';
		title: string;
		message: string;
		showLink?: boolean;
		linkHref?: string;
		linkText?: string;
	}

	let {
		variant,
		title,
		message,
		showLink = false,
		linkHref = '#',
		linkText = 'Learn more'
	}: Props = $props();

	const variantClasses = {
		success: {
			container:
				'border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15',
			icon: 'text-success-500'
		},
		error: {
			container: 'border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15',
			icon: 'text-error-500'
		},
		warning: {
			container:
				'border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15',
			icon: 'text-warning-500'
		},
		info: {
			container:
				'border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15',
			icon: 'text-blue-light-500'
		}
	};

	const icons = {
		success: BadgeCheck,
		error: CircleX,
		warning: CircleAlert,
		info: Info
	};
</script>

<div class="rounded-xl border p-4 {variantClasses[variant].container}">
	<div class="flex items-start gap-3">
		<div class="-mt-0.5 {variantClasses[variant].icon}">
			{@render icon(variant)}
		</div>

		<div>
			<h4 class="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">
				{title}
			</h4>

			<p class="text-sm text-gray-500 dark:text-gray-400">{message}</p>

			{#if showLink}
				<a
					href={linkHref}
					class="mt-3 inline-block text-sm font-medium text-gray-500 underline dark:text-gray-400"
				>
					{linkText}
				</a>
			{/if}
		</div>
	</div>
</div>

{#snippet icon(variant: Props['variant'])}
	{@const Icon = icons[variant]}
	<Icon />
{/snippet}
