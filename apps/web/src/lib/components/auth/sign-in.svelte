<script lang="ts">
	import { Button } from '@/lib/components/ui/button';
	import { Checkbox } from '@/lib/components/ui/checkbox';
	import { Input } from '@/lib/components/ui/input';
	import { Label } from '@/lib/components/ui/label';
	import { LoaderCircle } from 'lucide-svelte';
	import { ChevronLeftIcon } from 'lucide-svelte';
	import { EyeIcon } from 'lucide-svelte';
	import { EyeClosedIcon } from 'lucide-svelte';
	import { signIn } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);

	let isChecked = $state(false);
	let isLoading = $state(false);

	const handleSignin = async (e: Event) => {
		e.preventDefault();
		isLoading = true;
		await signIn.email(
			{
				email: email,
				password: password,
				callbackURL: '/'
			},
			{
				onError(context) {
					alert(context.error.message);
				}
			}
		);
		isLoading = false;
	};

	$effect(() => {
		console.log(email, password);
	})
</script>

<div class="flex w-full flex-1 flex-col lg:w-1/2">
	<div class="mx-auto mb-5 w-full max-w-md sm:pt-10">
		<a
			href="/"
			class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
		>
			<ChevronLeftIcon />
			Back to dashboard
		</a>
	</div>
	<div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
		<div>
			<div class="mb-5 sm:mb-8">
				<h1
					class="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90"
				>
					Sign In
				</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Enter your email and password to sign in!
				</p>
			</div>
			<div>
				<form onsubmit={handleSignin}>
					<div class="space-y-6">
						<div>
							<Label>
								Email <span class="text-error-500">*</span>{' '}
							</Label>
							<Input
								placeholder="johndoe@gmail.com"
								type="email"
								bind:value={email}
							/>
						</div>
						<div>
							<Label>
								Password <span class="text-error-500">*</span>{' '}
							</Label>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div class="relative">
								<Input
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									bind:value={password}
								/>
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<span
									onclick={() => (showPassword = !showPassword)}
									class="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
								>
									{#if showPassword}
										<EyeIcon class="fill-gray-500 dark:fill-gray-400" />
									{:else}
										<EyeClosedIcon class="fill-gray-500 dark:fill-gray-400" />
									{/if}
								</span>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Checkbox checked={isChecked} onChange={() => (isChecked = !isChecked)} />
								<span class="block text-theme-sm font-normal text-gray-700 dark:text-gray-400">
									Keep me logged in
								</span>
							</div>
							<a
								href="/reset-password"
								class="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
							>
								Forgot password?
							</a>
						</div>
						<div>
							<Button className="w-full" size="sm" disabled={isLoading}>
								{#if isLoading}
									<div class="flex items-center justify-center gap-2">
										<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
										<span> Signing in...</span>
									</div>
								{:else}
									Sign in
								{/if}
							</Button>
						</div>
					</div>
				</form>

				<div class="mt-5">
					<p class="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
						Don&apos;t have an account? {''}
						<a href="/signup" class="text-brand-500 hover:text-brand-600 dark:text-brand-400">
							Sign Up
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
