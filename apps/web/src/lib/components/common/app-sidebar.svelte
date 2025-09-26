<script lang="ts">
	import { page } from '$app/state';
	import { Calendar, CalendarIcon, ChevronDown, DotIcon, ListIcon, TableIcon } from 'lucide-svelte';
	import { getSidebarStore } from '@/lib/stores/ui/sidebar-store.svelte';
	import { useProjects } from '@/lib/queries/use-projects';
	import ProjectDropdown from "../projects/dropdown/organization-dropdown.svelte";
	import { setOrganizationStore, getOrganizationStore } from '@/lib/stores/ui/organization-store.svelte';
	import { createQuery } from "@tanstack/svelte-query";
	import { getProjects } from "@/lib/api/projects";
	
	type NavItem = {
		name: string;
		icon: any; // Lucide icon component
		path?: string;
		subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
	};

	const navItems: NavItem[] = [
		{
			icon: Calendar,
			name: 'Dashboard',
			subItems: [{ name: 'Ecommerce', path: '/', pro: false }]
		},
		{
			icon: Calendar,
			name: 'Calendar',
			path: '/calendar'
		},
		{
			icon: Calendar,
			name: 'User Profile',
			path: '/profile'
		},

		{
			name: 'Forms',
			icon: ListIcon,
			subItems: [{ name: 'Form Elements', path: '/form-elements', pro: false }]
		},
		{
			name: 'Tables',
			icon: TableIcon,
			subItems: [{ name: 'Basic Tables', path: '/basic-tables', pro: false }]
		},
		{
			name: 'Pages',
			icon: CalendarIcon,
			subItems: [
				{ name: 'Blank Page', path: '/blank', pro: false },
				{ name: '404 Error', path: '/error-404', pro: false }
			]
		}
	];

	const othersItems: NavItem[] = [
		{
			icon: CalendarIcon,
			name: 'Charts',
			subItems: [
				{ name: 'Line Chart', path: '/line-chart', pro: false },
				{ name: 'Bar Chart', path: '/bar-chart', pro: false }
			]
		}
	];

	const organizationStore = getOrganizationStore();
	const selectedOrganization = $derived(organizationStore.organization);

	const sidebar = getSidebarStore();
	const projectsQuery = createQuery(() => ({
    queryKey: ['projects'],
    queryFn: () => getProjects('dc574f66-69f1-4a9f-a691-0cefebeefe02'),
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  }));
	let openSubmenu = $state<{ type: string; index: number } | null>(null);
	let subMenuHeight = $state<Record<string, number>>({});
	let subMenuRefs = $state<Record<string, HTMLDivElement>>({});

	const isActive = (path: string) => path === page.url.pathname;

	let submenuMatched = $state(false);

	$effect(() => {
		submenuMatched = false;
		['main', 'others'].forEach((type) => {
			const items = type === 'main' ? navItems : othersItems;
			items.forEach((nav, index) => {
				if (nav.subItems) {
					nav.subItems.forEach((subItem) => {
						if (isActive(subItem.path)) {
							openSubmenu = {
								type: type as 'main' | 'others',
								index
							};
							submenuMatched = true;
						}
					});
				}
			});
		});
		if (!submenuMatched) {
			openSubmenu = null;
		}
	});

	$effect(() => {
		if (openSubmenu) {
			const key = `${openSubmenu.type}-${openSubmenu.index}`;
			if (subMenuRefs[key]) {
				subMenuHeight[key] = subMenuRefs[key].scrollHeight;
			}
		}
	});

	const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
		if (openSubmenu && openSubmenu.type === menuType && openSubmenu.index === index) {
			openSubmenu = null;
		} else {
			openSubmenu = { type: menuType, index };
		}
	};

	const projects = $derived(
		(projectsQuery?.data as any)?.data?.map((project: any) => ({
			icon: Calendar,
			name: project.name,
			path: `/projects/${project.id}`
		}))
	);
</script>

<aside
	class="fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 {sidebar.isExpanded ||
	sidebar.isMobileOpen
		? 'w-[290px]'
		: sidebar.isHovered
			? 'w-[290px]'
			: 'w-[90px]'} {sidebar.isMobileOpen
		? 'translate-x-0'
		: '-translate-x-full'}   lg:translate-x-0"
	onmouseenter={() => !sidebar.isExpanded && sidebar.setIsHovered(true)}
	onmouseleave={() => sidebar.setIsHovered(false)}
>
	<div
		class={`flex py-8  ${!sidebar.isExpanded && !sidebar.isHovered ? 'lg:justify-center' : 'justify-start'}`}
	>
		<a href="/">
			{#if sidebar.isExpanded || sidebar.isHovered || sidebar.isMobileOpen}
				<div class="hidden items-center justify-center gap-3 dark:flex">
					<img
						class="hidden rounded-lg dark:block"
						src="/images/speck-logo.png"
						alt="Logo"
						width={32}
						height={32}
					/>
					<p class="text-2xl font-medium dark:text-white">Speck</p>
				</div>
			{:else}
				<img src="/images/speck-logo.png" alt="Logo" width={32} height={32} />
			{/if}
		</a>
	</div>
	<div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
		<nav class="mb-6 space-y-6">
			<ProjectDropdown />
			<div class="flex flex-col gap-6">
				<div>
					<h2
						class={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
							!sidebar.isExpanded && !sidebar.isHovered ? 'lg:justify-center' : 'justify-start'
						}`}
					>
						{#if sidebar.isExpanded || sidebar.isHovered || sidebar.isMobileOpen}
							Menu
						{:else}
							<DotIcon />
						{/if}
					</h2>

					{@render renderMenuItems(
						[
							{ icon: Calendar, name: 'Settings', path: '/' },
							{ icon: Calendar, name: 'Integrations', path: '/' },
							{ icon: Calendar, name: 'Schedules', path: '/' }
						],
						'main'
					)}
				</div>
				<div>
					<h2
						class={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
							!sidebar.isExpanded && !sidebar.isHovered ? 'lg:justify-center' : 'justify-start'
						}`}
					>
						{#if sidebar.isExpanded || sidebar.isHovered || sidebar.isMobileOpen}
							Projects
						{:else}
							<DotIcon />
						{/if}
					</h2>

					{#if (projects?.length ?? 0) > 0}
						{@render renderMenuItems(projects || [], 'main')}
					{/if}
				</div>
			</div>
		</nav>
		<!-- {#if isExpanded || isHovered || isMobileOpen}
    <SidebarWidget />
  {/if} -->
	</div>
</aside>

{#snippet renderMenuItems(items: NavItem[], type: 'main' | 'others')}
	<ul class="flex flex-col gap-4">
		{#each items as item, index}
			{#if item.subItems}
				<button
					onclick={() => handleSubmenuToggle(index, type as 'main' | 'others')}
					class={`group menu-item  ${
						openSubmenu?.type === type && openSubmenu?.index === index
							? 'menu-item-active'
							: 'menu-item-inactive'
					} cursor-pointer ${
						!sidebar.isExpanded && !sidebar.isHovered ? 'lg:justify-center' : 'lg:justify-start'
					}`}
				>
					<span
						class={` ${
							openSubmenu?.type === type && openSubmenu?.index === index
								? 'menu-item-icon-active'
								: 'menu-item-icon-inactive'
						}`}
					>
						{#if item.icon === Calendar}
							<Calendar />
						{:else if item.icon === ListIcon}
							<ListIcon />
						{:else if item.icon === TableIcon}
							<TableIcon />
						{:else if item.icon === CalendarIcon}
							<CalendarIcon />
						{/if}
					</span>
					{#if sidebar.isExpanded || sidebar.isHovered || sidebar.isMobileOpen}
						<span class={`menu-item-text`}>{item.name}</span>
					{/if}

					{#if sidebar.isExpanded || sidebar.isHovered || sidebar.isMobileOpen}
						<ChevronDown
							class="ml-auto h-5 w-5 transition-transform duration-200 {openSubmenu?.type ===
								type && openSubmenu?.index === index
								? 'rotate-180 text-brand-500'
								: ''}"
						/>
					{/if}
				</button>
			{:else if item.path}
				<a
					href={item.path}
					class={`group menu-item ${
						isActive(item.path) ? 'menu-item-active' : 'menu-item-inactive'
					}`}
				>
					<span
						class={`${isActive(item.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}`}
					>
						{#if item.icon === Calendar}
							<Calendar />
						{:else if item.icon === ListIcon}
							<ListIcon />
						{:else if item.icon === TableIcon}
							<TableIcon />
						{:else if item.icon === CalendarIcon}
							<CalendarIcon />
						{/if}
					</span>
					{#if sidebar.isExpanded || sidebar.isHovered || sidebar.isMobileOpen}
						<span class={`menu-item-text`}>{item.name}</span>
					{/if}
				</a>
			{/if}
			{#if item.subItems && (sidebar.isExpanded || sidebar.isHovered || sidebar.isMobileOpen)}
				<div
					bind:this={subMenuRefs[`${type}-${index}`]}
					class="-mt-4 overflow-hidden transition-all duration-300"
					style:height={openSubmenu?.type === type && openSubmenu?.index === index
						? `${subMenuHeight[`${type}-${index}`]}px`
						: '0px'}
				>
					<ul class="mt-2 ml-9 space-y-1">
						{#each item.subItems as subItem}
							<li>
								<a
									href={subItem.path}
									class={`menu-dropdown-item ${
										isActive(subItem.path)
											? 'menu-dropdown-item-active'
											: 'menu-dropdown-item-inactive'
									}`}
								>
									{subItem.name}
									<span class="ml-auto flex items-center gap-1">
										{#if subItem.new}
											<span
												class={`ml-auto ${
													isActive(subItem.path)
														? 'menu-dropdown-badge-active'
														: 'menu-dropdown-badge-inactive'
												} menu-dropdown-badge `}
											>
												new
											</span>
										{/if}
										{#if subItem.pro}
											<span
												class={`ml-auto ${
													isActive(subItem.path)
														? 'menu-dropdown-badge-active'
														: 'menu-dropdown-badge-inactive'
												} menu-dropdown-badge `}
											>
												pro
											</span>
										{/if}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/each}
	</ul>
{/snippet}
