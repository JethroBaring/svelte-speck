<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import BellIcon from '@lucide/svelte/icons/bell';

	let sampleNotifications = $state([
		{
			id: 1,
			title: 'Notification 1',
			description: 'This is the first notification'
		}
	]);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button {...props} class="flex h-9 w-9 items-center justify-center rounded-full border bg-[#171f2f] p-2"
				><BellIcon class="size-4" /></button
			>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-96 space-y-1 rounded-md" align="end" side="bottom" sideOffset={5}>
		<DropdownMenu.Label class="text-muted-foreground text-xs">Notifications</DropdownMenu.Label>
		{#each sampleNotifications as notification, index (notification.id)}
			<DropdownMenu.Item class="gap-2 p-2">
				{notification.title}
				<DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		{/each}
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="gap-2 p-2">
			<div class="bg-background flex size-6 items-center justify-center rounded-md border">
				<PlusIcon class="size-4" />
			</div>
			<div class="text-muted-foreground font-medium">Add team</div>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
