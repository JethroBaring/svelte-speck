<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { signIn } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	const handleSignin = async () => {
		isLoading = true;
		error = '';
		try {
			await signIn.email(
				{
					email: email,
					password: password
				},
				{
					onSuccess: async () => {
						goto('/workspace');
					},
					onError(context: any) {
						error = context.error.message;
					}
				}
			);
		} catch (error: any) {
			error = error.message;
		}
		isLoading = false;
	};
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href="##" class="flex items-center gap-2 font-medium">
				<img src="/images/speck-logo.png" alt="Speck" class="size-8" />
				<span class="text-2xl">Speck</span>
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<div class="flex flex-col gap-6">
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-2xl font-bold">Login to your account</h1>
						<p class="text-sm text-balance text-muted-foreground">
							Enter your email below to login to your account
						</p>
					</div>
					<div class="grid gap-6">
						<div class="grid gap-3">
							<Label for="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								bind:value={email}
							/>
						</div>
						<div class="grid gap-3">
							<div class="flex items-center">
								<Label for="password">Password</Label>
								<a href="##" class="ml-auto text-sm underline-offset-4 hover:underline">
									Forgot your password?
								</a>
							</div>
							<Input id="password" type="password" required bind:value={password} />
						</div>
						{#if error}
							<div class="text-sm text-red-500">{error}</div>
						{/if}
						<Button type="submit" class="w-full" onclick={handleSignin} disabled={isLoading}>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</Button>
					</div>
					<div class="text-center text-sm">
						Don&apos;t have an account?
						<a href="/signup" class="underline underline-offset-4"> Sign up </a>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="relative hidden items-center justify-center bg-white/5 lg:flex">
		<img src="/images/undraw_signin.svg" alt="signin" class="h-1/3 object-cover" />
	</div>
</div>
