<script lang="ts">
	import { generateColorFromName } from '$lib/avatar-color';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import XIcon from '@lucide/svelte/icons/x';
	import moment from 'moment';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';

	interface ComponentProps {
		closeComments: () => void;
	}

	let { closeComments }: ComponentProps = $props();
	let comments = $state([
		{
			id: 1,
			author: 'Alice Smith',
			content: 'This test case looks good to me!',
			createdAt: new Date('2025-09-03T10:00:00'),
			image: ''
		},
		{
			id: 2,
			author: 'Bob Johnson',
			content: 'Should we add more edge cases?',
			createdAt: new Date('2025-10-03T10:05:00'),
			image: ''
		},
		{
			id: 3,
			author: 'Alice Smith',
			content: 'This test case looks good to me!',
			createdAt: new Date(),
			image: ''
		}
	]);
</script>

<div class="grid h-full w-1/3">
	<InputGroup.Root>
		<InputGroup.Addon align="block-start" class="border-b">
			<InputGroup.Text class="text-base font-medium">Comments</InputGroup.Text>
			<InputGroup.Button class="ml-auto" size="icon-xs" onclick={closeComments}>
				<XIcon class="size-4" />
			</InputGroup.Button>
		</InputGroup.Addon>
		<div class="flex-1 w-full p-3">
			{#if false}
				<div class="flex h-full items-center justify-center">
					<div class="flex flex-col items-center gap-2">
						<div class="rounded-full bg-white/[0.03] p-3">
							<MessageCircleIcon />
						</div>
						<div class="flex flex-col items-center gap-1">
							<p class="text-sm text-gray-300">No comments yet</p>
							<p class="text-xs text-gray-500">Start the conversation</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					{#each comments as comment}
						<div class="flex items-start gap-2">
							<Avatar.Root class="size-8 {generateColorFromName(comment.author || '')}">
								<Avatar.Image src={comment.image} alt={comment.author} />
								<Avatar.Fallback
									>{comment.author
										.split(' ')
										.map((name) => name[0])
										.join('')
										.toUpperCase()}</Avatar.Fallback
								>
							</Avatar.Root>
							<div class="flex flex-col gap-1">
								<div class="flex items-center gap-2">
									<p class="text-sm">{comment.author}</p>
									<p class="text-xs text-gray-500">
										{#if moment().isSame(moment(comment.createdAt), 'day')}
											{moment(comment.createdAt).fromNow()}
										{:else if moment().subtract(1, 'day').isSame(moment(comment.createdAt), 'day')}
											Yesterday, {moment(comment.createdAt).format('h:mm A')}
										{:else}
											{moment(comment.createdAt).format('MMM D, h:mm A')}
										{/if}
									</p>
								</div>
								<div>
									<p class="text-sm font-light">{comment.content}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="w-full p-3">
			<InputGroup.Root>
				<InputGroup.Input placeholder="Send a message..." />
				<InputGroup.Addon align="inline-end">
					<InputGroup.Button variant="default" class="ml-auto rounded-full" size="icon-xs">
						<!-- <Spinner /> -->
						<ArrowUpIcon />
						<span class="sr-only">Send</span>
					</InputGroup.Button>
				</InputGroup.Addon>
			</InputGroup.Root>
		</div>
	</InputGroup.Root>
</div>

<!-- <Card.Root class="h-full w-1/3">
	<Card.Header class="flex items-center justify-between border-b !pb-4">
		<div class="flex items-center gap-2">Comments</div>
		<button onclick={closeComments}>
			<XIcon class="size-4" />
		</button>
	</Card.Header>
	<Card.Content class="flex-1">
		{#if false}
			<div class="flex h-full items-center justify-center">
				<div class="flex flex-col items-center gap-2">
					<div class="rounded-full bg-white/[0.03] p-3">
						<MessageCircleIcon />
					</div>
					<div class="flex flex-col items-center gap-1">
						<p class="text-sm text-gray-300">No comments yet</p>
						<p class="text-xs text-gray-500">Start the conversation</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each comments as comment}
					<div class="flex items-start gap-2">
						<Avatar.Root class="size-8 {generateColorFromName(comment.author || '')}">
							<Avatar.Image src={comment.image} alt={comment.author} />
							<Avatar.Fallback
								>{comment.author
									.split(' ')
									.map((name) => name[0])
									.join('')
									.toUpperCase()}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<p class="text-sm">{comment.author}</p>
								<p class="text-xs text-gray-500">
									{#if moment().isSame(moment(comment.createdAt), 'day')}
										{moment(comment.createdAt).fromNow()}
									{:else if moment().subtract(1, 'day').isSame(moment(comment.createdAt), 'day')}
										Yesterday, {moment(comment.createdAt).format('h:mm A')}
									{:else}
										{moment(comment.createdAt).format('MMM D, h:mm A')}
									{/if}
								</p>
							</div>
							<div>
								<p class="text-sm font-light">{comment.content}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
	<Card.Footer>
		<InputGroup.Root>
			<InputGroup.Input placeholder="Send a message..." disabled />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button variant="default" class="ml-auto rounded-full" size="icon-xs" disabled>
					<!-- <Spinner /> -->
<!-- <ArrowUpIcon />
					<span class="sr-only">Send</span>
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
	</Card.Footer>
</Card.Root> -->
