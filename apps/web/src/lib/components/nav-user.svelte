<script lang="ts">
	import { goto } from '$app/navigation';
	import { signOut, useSession } from '$lib/auth-client';
	import { generateColorFromName } from '$lib/avatar-color';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	const sidebar = useSidebar();

	const session = useSession();

	if(!session) {
		goto('/signin');
	}

</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-white/5 data-[state=open]:text-gray-300"
						{...props}
					>
						<Avatar.Root class="size-8 {generateColorFromName($session?.data?.user.name! || '')}">
							<Avatar.Image src={$session?.data?.user.image} alt={$session?.data?.user.name} />
							<Avatar.Fallback>{($session?.data?.user.name?.split(' ').map(name => name[0]) || []).join('').toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{$session?.data?.user.name}</span>
							<span class="truncate text-xs">{$session?.data?.user.email}</span>
						</div>
						<ChevronsUpDownIcon class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 space-y-1 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'top'}
				align="end"
				sideOffset={5}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="size-8 {generateColorFromName($session?.data?.user.name!)}">
							<Avatar.Image src={$session?.data?.user.image} alt={$session?.data?.user.name} />
							<Avatar.Fallback>CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{$session?.data?.user.name}</span>
							<span class="truncate text-xs">{$session?.data?.user.email}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<!-- <DropdownMenu.Separator /> -->
				<!-- <DropdownMenu.Group>
					<DropdownMenu.Item>
						<SparklesIcon />
						Upgrade to Pro
					</DropdownMenu.Item>
				</DropdownMenu.Group> -->
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<BadgeCheckIcon />
						Account
					</DropdownMenu.Item>
					<!-- <DropdownMenu.Item>
						<CreditCardIcon />
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<BellIcon />
						Notifications
					</DropdownMenu.Item> -->
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					onclick={() => {
						signOut(
							{},
							{
								onSuccess: () => {
									goto('/signin');
								}
							}
						);
					}}
				>
					<LogOutIcon />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
