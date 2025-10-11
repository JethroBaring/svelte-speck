<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { cn } from '$lib/utils';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let messages = $state([
		{
			role: 'user',
			content: 'Hello, how are you?'
		},
		{
			role: 'assistant',
			content: 'I am fine, thank you!'
		}
	]);
</script>

<div class="flex-1 h-full flex flex-col">
	<div class="flex flex-1 flex-col gap-3">
		{#each messages as message (message.content)}
			{#if message.role === 'user'}
				<div
					class={cn(
						'ml-auto flex w-full flex-col gap-2 rounded-sm border border-gray-800 bg-[#171f2f] px-3 py-2 text-sm text-primary-foreground'
					)}
				>
					{message.content}
				</div>
			{:else}
				<div class={cn('flex w-max max-w-[75%] flex-col gap-2 rounded-sm py-2 text-sm')}>
					{message.content}
				</div>
			{/if}
		{/each}
	</div>
	<InputGroup.Root>
		<InputGroup.Textarea placeholder="Ask, Search or Chat..." />
		<InputGroup.Addon align="block-end">
			<InputGroup.Button variant="outline" class="rounded-full" size="icon-xs">
				<PlusIcon />
			</InputGroup.Button>
			<InputGroup.Button variant="default" class="ml-auto rounded-full" size="icon-xs" disabled>
				<ArrowUpIcon />
				<span class="sr-only">Send</span>
			</InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>
</div>
