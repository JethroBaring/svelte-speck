<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { useSession } from '$lib/auth-client';

	const session = useSession();

	let name = $state('');
	let email = $state('');
	$effect(() => {
		if (!name && $session?.data?.user?.name) name = $session.data.user.name;
		if (!email && $session?.data?.user?.email) email = $session.data.user.email;
	});

	// AI API Keys
	let openaiKey = $state('');
	let anthropicKey = $state('');

	// Change password
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	const saveAccount = async () => {
		// TODO: Wire to backend endpoint when available
		console.log('save account', { name, email });
	};

	const saveApiKeys = async () => {
		// TODO: Wire to backend endpoint when available
		console.log('save api keys', { openaiKey, anthropicKey });
	};

	const changePassword = async () => {
		if (newPassword !== confirmPassword) return;
		// TODO: Wire to auth password change when available
		console.log('change password', { currentPassword, newPassword });
	};
</script>

<div class="flex flex-1 flex-col gap-10 p-6 lg:flex-row">
	<aside class="flex-1w-full self-start lg:sticky lg:top-20 lg:w-64">
		<nav class="text-sm">
			<ul class="grid gap-2">
				<li>
					<a
						href="#account"
						class="hover:text-accent-foreground block rounded-sm px-3 py-2 transition hover:bg-white/5"
						>Account</a
					>
				</li>
				<li>
					<a
						href="#ai-api-keys"
						class="hover:text-accent-foreground block rounded-sm px-3 py-2 transition hover:bg-white/5"
						>AI API Keys</a
					>
				</li>
				<li>
					<a
						href="#change-password"
						class="hover:text-accent-foreground block rounded-sm px-3 py-2 transition hover:bg-white/5"
						>Change Password</a
					>
				</li>
			</ul>
		</nav>
	</aside>

	<div class="flex-1 overflow-scroll">
		<div class="flex h-0 flex-1 flex-col gap-10">
			<div class="w-full max-w-2xl" id="account">
				<h2 class="text-xl font-semibold">Account</h2>
				<p class="text-muted-foreground text-sm">Update your profile information.</p>
				<div class="mt-6 grid gap-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" type="text" bind:value={name} />
					</div>
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input id="email" type="email" bind:value={email} />
					</div>
					<div class="flex gap-2 pt-2">
						<Button onclick={saveAccount}>Save</Button>
					</div>
				</div>
			</div>

			<Separator />

			<div class="w-full max-w-2xl" id="ai-api-keys">
				<h2 class="text-xl font-semibold">AI API Keys</h2>
				<p class="text-muted-foreground text-sm">Store provider keys for running AI features.</p>
				<div class="mt-6 grid gap-4">
					<div class="grid gap-2">
						<Label for="openai">OpenAI API Key</Label>
						<Input id="openai" type="password" placeholder="sk-..." bind:value={openaiKey} />
					</div>
					<div class="grid gap-2">
						<Label for="anthropic">Anthropic API Key</Label>
						<Input
							id="anthropic"
							type="password"
							placeholder="sk-ant-..."
							bind:value={anthropicKey}
						/>
					</div>
					<div class="flex gap-2 pt-2">
						<Button onclick={saveApiKeys}>Save Keys</Button>
					</div>
				</div>
			</div>

			<Separator />

			<div class="w-full max-w-2xl" id="change-password">
				<h2 class="text-xl font-semibold">Change Password</h2>
				<p class="text-muted-foreground text-sm">Set a strong, unique password.</p>
				<div class="mt-6 grid gap-4">
					<div class="grid gap-2">
						<Label for="currentPassword">Current Password</Label>
						<Input id="currentPassword" type="password" bind:value={currentPassword} />
					</div>
					<div class="grid gap-2">
						<Label for="newPassword">New Password</Label>
						<Input id="newPassword" type="password" bind:value={newPassword} />
					</div>
					<div class="grid gap-2">
						<Label for="confirmPassword">Confirm New Password</Label>
						<Input id="confirmPassword" type="password" bind:value={confirmPassword} />
					</div>
					<div class="flex gap-2 pt-2">
						<Button
							onclick={changePassword}
							disabled={newPassword !== confirmPassword || !newPassword || !currentPassword}
							>Update Password</Button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
