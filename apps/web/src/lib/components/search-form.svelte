<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Input } from './ui/input';

	let isOpen = $state(false);
</script>

<button onclick={() => (isOpen = true)}>
	<div class="py-0">
		<div class="relative">
			<Label for="search" class="sr-only">Search</Label>
			<Input
				id="search"
				placeholder="Search for commands..."
				readonly
				class="pointer-events-none pl-8"
			/>
			<SearchIcon
				class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
			/>
		</div>
	</div>
</button>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content showCloseButton={false} class="top-1/4 p-0">
		<div class="relative border-b p-[1px]">
			<SearchIcon
				class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
			/>
			<Input placeholder="Search for commands..." class="h-10 rounded-lg border-none pl-8" />
		</div>
		<div class="p-4">hello world</div>
	</Dialog.Content>
</Dialog.Root>
