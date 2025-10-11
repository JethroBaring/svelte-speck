<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { Input } from '$lib/components/ui/input';
	import { ChevronDownIcon, ExternalLink } from '@lucide/svelte';

	let apiKey = $state('');
	let isOpen = $state(true);

	const handleApiKeySubmit = () => {
		if (apiKey.trim()) {
			console.log('Gemini API key saved:', apiKey);
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleApiKeySubmit();
		}
	};
</script>

<div class="space-y-3">
	<div>
		<p class="text-sm">LLM Provider</p>
		<p class="text-sm text-gray-400">Add at least one API key to use the assistant</p>
	</div>
	<Collapsible.Root class="flex flex-col gap-2 text-sm" bind:open={isOpen}>
		<Collapsible.Trigger onclick={(e) => e.stopPropagation()}>
			{#snippet child({ props })}
				<div class="flex items-center justify-between gap-2 text-gray-400">
					Gemini
					<div class="flex items-center gap-[2px]">
						<button
							{...props}
							class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
						>
							<ChevronDownIcon class="size-4" />
						</button>
					</div>
				</div>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content class="flex flex-col gap-2">
			<div class="space-y-3">
				<p class="text-sm text-gray-300">To use Gemini in this application, you need an API key:</p>

				<ul class="space-y-2 text-sm text-gray-400">
					<li class="flex items-center gap-2">
						<span class="text-gray-500">•</span>
						<span>Get your API key from the</span>
						<a
							href="https://aistudio.google.com/app/apikey"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-blue-400 transition-colors hover:text-blue-300"
						>
							Google AI Studio
							<ExternalLink class="h-3 w-3" />
						</a>
					</li>
				</ul>

				<!-- API Key Input -->
				<div class="space-y-2">
					<Input
						bind:value={apiKey}
						placeholder="AIzaSy00000000000000000000000000000000000"
						class="w-full"
						onkeydown={handleKeyDown}
					/>
				</div>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
