<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
</script>

<div>
	<Collapsible.Root>
		<Collapsible.Trigger>Can I use this in my project?</Collapsible.Trigger>
		<Collapsible.Content>
			<ul
				data-slot="sidebar-menu-sub"
				data-sidebar="menu-sub"
				class={cn(
					'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
					'group-data-[collapsible=icon]:hidden'
				)}
			>
				<li
					data-slot="sidebar-menu-sub-item"
					data-sidebar="menu-sub-item"
					class={cn('group/menu-sub-item relative')}
				>
					<a href="#">Test</a>
				</li>
				<Collapsible.Root>
					<Collapsible.Trigger
						><li
							data-slot="sidebar-menu-sub-item"
							data-sidebar="menu-sub-item"
							class={cn('group/menu-sub-item relative')}
						>
							<a href="#">Test</a>
						</li></Collapsible.Trigger
					>
					<Collapsible.Content>
						<ul
							data-slot="sidebar-menu-sub"
							data-sidebar="menu-sub"
							class={cn(
								'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
								'group-data-[collapsible=icon]:hidden'
							)}
						>
							<li
								data-slot="sidebar-menu-sub-item"
								data-sidebar="menu-sub-item"
								class={cn('group/menu-sub-item relative')}
							>
								<a href="#">Test</a>
							</li>
						</ul>
					</Collapsible.Content>
				</Collapsible.Root>
			</ul>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
