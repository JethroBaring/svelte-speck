<script lang="ts">
	import { getTestSuiteRunnerStore } from '$lib/stores/websocket/test-suite-runner-store.svelte';

	const testSuiteRunnerStore = getTestSuiteRunnerStore();

	let showRunPill = $state(false);
	let exitingRunPill = $state(false);

	$effect(() => {
		if (testSuiteRunnerStore.status === 'RUNNING') {
			showRunPill = true;
			exitingRunPill = false;
			return;
		}

		if (showRunPill) {
			const totalHoldMs = 1000; // total time to keep pill after RUNNING ends
			const exitDurationMs = 300; // duration of the fade/drop
			const startExitAfter = Math.max(0, totalHoldMs - exitDurationMs);

			const startExitId = setTimeout(() => {
				exitingRunPill = true;
			}, startExitAfter);

			const hideId = setTimeout(() => {
				showRunPill = false;
				exitingRunPill = false;
			}, totalHoldMs);

			return () => {
				clearTimeout(startExitId);
				clearTimeout(hideId);
			};
		}
	});

	// Dynamically calculate gradient based on progress (returns background value)
	const getGradientBackground = $derived((progressPercent: number) => {
		const clamped = Math.max(0, Math.min(progressPercent, 100));
		const featherWidth = 20; // wider blend region for maximum softness
		const halfFeather = featherWidth / 2;
		const startBlend = Math.max(0, clamped - halfFeather);
		const endBlend = Math.min(100, clamped + halfFeather);

		// Edge cases: 0% and 100%
		if (clamped === 0) {
			return `linear-gradient(to right,
		          rgb(23, 31, 47) 0%,
		          rgb(23, 31, 47) 100%)`;
		}
		if (clamped === 100) {
			return `linear-gradient(to right,
		          rgba(59, 130, 246, 0.2) 0%,
		          rgba(59, 130, 246, 0.2) 100%)`;
		}

		// If blend ends at 100%, omit the redundant stop to avoid a hard edge
		if (endBlend >= 100) {
			return `linear-gradient(to right,
		          rgba(59, 130, 246, 0.2) 0%,
		          rgba(59, 130, 246, 0.2) ${startBlend}%,
		          rgb(23, 31, 47) 100%)`;
		}

		// Normal blended case
		return `linear-gradient(to right,
		        rgba(59, 130, 246, 0.2) 0%,
		        rgba(59, 130, 246, 0.2) ${startBlend}%,
		        rgb(30, 41, 59) ${endBlend}%,
		        rgb(23, 31, 47) 100%)`;
	});

	// Fixed-width numeric layout to prevent width shifts
	const totalDigits = $derived(String(testSuiteRunnerStore.progress.total ?? 0).length || 1);
</script>

{#if showRunPill}
	<div
		class="fixed bottom-6 right-6 flex items-center gap-2 overflow-hidden rounded-full bg-[#101828] px-4 py-3 text-sm font-medium text-white shadow-lg"
		style="background: {getGradientBackground(
			(testSuiteRunnerStore.progress.completed / testSuiteRunnerStore.progress.total) * 100
		)}; box-shadow: 0 4px 12px rgba(0,0,0,0.15); {exitingRunPill
			? 'animation: pillExit 300ms ease forwards;'
			: ''}"
	>
		<div
			class="pointer-events-none absolute inset-0"
			style="background: linear-gradient(90deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.22) 50%, rgba(59,130,246,0.12) 100%); {exitingRunPill
				? ''
				: 'animation: breathePill 2.2s ease-in-out infinite;'}"
		></div>
		<div class="relative h-full w-full">
		<div class="relative z-[1] flex items-center gap-2">
			<div class="h-2 w-2 rounded-full bg-[#22c55e]"></div>
			<span class="opacity-90">Running tests:</span>
			<span class="tabular-nums inline-flex">
				<span class="inline-block" style="min-width: {totalDigits}ch; text-align: right;">{testSuiteRunnerStore.progress.completed}</span>
				<span class="px-0.5">/</span>
				<span class="inline-block" style="min-width: {totalDigits}ch; text-align: right;">{testSuiteRunnerStore.progress.total}</span>
			</span>
		</div>
		</div>
	</div>
{/if}

<style lang="css">
	@keyframes breatheGlow {
		0% {
			opacity: 0.5;
			transform: translateX(-50%) scaleX(0.95);
		}
		50% {
			opacity: 1;
			transform: translateX(-50%) scaleX(1.15);
		}
		100% {
			opacity: 0.5;
			transform: translateX(-50%) scaleX(0.95);
		}
	}

	@keyframes breathePill {
		0% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.6;
		}
	}

	@keyframes pillExit {
		0% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(6px) scale(0.98);
		}
	}
</style>
