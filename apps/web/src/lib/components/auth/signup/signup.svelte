<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	import { signUp } from '$lib/auth-client';

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let success = $state('');

	const handleSignUp = async () => {
		isLoading = true;
		error = '';
		const user = {
			firstName: firstName,
			lastName: lastName,
			email: email,
			password: password
		};
		await signUp.email({
			email: user.email,
			password: user.password,
			name: `${user.firstName} ${user.lastName}`,
			callbackURL: '/',
			fetchOptions: {
				onSuccess() {
					goto('/workspace')
				},
				onError(context: any) {
					if (context.error.code === 'USER_ALREADY_EXISTS') {
						error = 'Email already exists';
					} else {
						error = context.error.message;
					}
				}
			}
		});
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
						<h1 class="text-2xl font-bold">Create your account</h1>
						<p class="text-sm text-balance text-muted-foreground">
							Enter your email below to sign up to your account
						</p>
					</div>
					<div class="grid gap-6">
						<div class="grid gap-3">
							<Label for="firstName">First Name</Label>
							<Input
								id="firstName"
								type="text"
								placeholder="John"
								required
								bind:value={firstName}
							/>
						</div>
						<div class="grid gap-3">
							<Label for="lastName">Last Name</Label>
							<Input id="lastName" type="text" placeholder="Doe" required bind:value={lastName} />
						</div>
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
							<Label for="password">Password</Label>
							<Input id="password" type="password" required bind:value={password} />
						</div>
						{#if error}
							<div class="text-sm text-red-500">{error}</div>
						{/if}
						<Button type="submit" class="w-full" onclick={handleSignUp} disabled={isLoading}>
							{isLoading ? 'Signing up...' : 'Sign up'}
						</Button>
					</div>
					<div class="text-center text-sm">
						Already have an account?
						<a href="/signin" class="underline underline-offset-4"> Sign in </a>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="relative hidden items-center justify-center bg-white/5 lg:flex">
		<img src="/images/undraw_signup.svg" alt="signup" class="h-1/3 object-cover" />
	</div>
</div>
