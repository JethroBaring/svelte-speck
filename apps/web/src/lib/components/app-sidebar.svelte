<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import NavMenu from './nav-menu.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavUser from './nav-user.svelte';
	import WorkspaceSwitcher from './workspace-switcher.svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu class="flex flex-col gap-5">
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5 bg-transparent hover:bg-transparent">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<img src="/images/speck-logo.png" alt="Speck" class="!size-8" />
							<span class="text-2xl font-semibold">Speck</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			<WorkspaceSwitcher />
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMenu />
		<NavProjects />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
