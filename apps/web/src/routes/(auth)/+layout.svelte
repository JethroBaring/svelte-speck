<script lang="ts">
	import type { Snippet } from 'svelte';
	import GridShape from '@/lib/components/common/grid-shape.svelte';

	interface LayoutProps {
		children: Snippet;
	}

	let { children }: LayoutProps = $props();
</script>

<div class="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
	<div
		class="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900"
	>
		{@render children?.()}
		<div class="hidden h-full w-full items-center bg-brand-950 lg:grid lg:w-1/2 dark:bg-white/5">
			<div class="relative z-1 flex items-center justify-center">
				<GridShape />
				<div class="flex max-w-xs flex-col items-center">
					<a href="/" class="mb-4 block">
						<img width={231} height={48} src="./images/logo/auth-logo.svg" alt="Logo" />
					</a>
					<p class="text-center text-gray-400 dark:text-white/60">
						Free and Open-Source Tailwind CSS Admin Dashboard Template
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
