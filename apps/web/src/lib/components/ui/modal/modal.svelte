<script lang="ts">
	import type { Snippet } from "svelte";

	interface ModalProps {
		isOpen: boolean;
		onClose: () => void;
		className?: string;
		children: Snippet;
		showCloseButton?: boolean; // New prop to control close button visibility
		isFullscreen?: boolean; // Default to false for backwards compatibility
	}

	let {
		isOpen,
		onClose,
		className,
		children,
		showCloseButton = true,
		isFullscreen = false
	}: ModalProps = $props();

	const contentClasses = isFullscreen
		? 'w-full h-full'
		: 'relative w-full rounded-xl bg-white  dark:bg-gray-900';

	let modalRef = $state<HTMLDivElement | null>(null);

	$effect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	});

	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	});
</script>

{#if isOpen}
	<div class="modal fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto">
		{#if !isFullscreen}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 h-full w-full bg-gray-400/10" onclick={(e) => e.stopPropagation()}></div>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div bind:this={modalRef} class="{contentClasses} {className}" onclick={(e) => e.stopPropagation()}>
			{#if showCloseButton}
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button
					onclick={onClose}
					class="absolute top-3 right-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:top-6 sm:right-6 sm:h-10 sm:w-10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
							fill="currentColor"
						/>
					</svg>
				</button>
			{/if}
			<div>{@render children?.()}</div>
		</div>
	</div>
{/if}
