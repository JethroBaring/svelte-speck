<script lang="ts">
	import Dropdown from '../../ui/dropdown/dropdown.svelte';
	import DropdownItem from '../../ui/dropdown/dropdown-item.svelte';
	import { Button } from '../../ui/button';
	import { Check, DoorOpen, Plus } from 'lucide-svelte';
	import { useOrganizations } from '@/lib/queries/use-organizations';
	import {
		setOrganizationStore,
		getOrganizationStore
	} from '@/lib/stores/ui/organization-store.svelte';
	import { useSession } from "@/lib/auth-client";

	let isOpen = $state(false);
	const user = useSession();
	const organizationQuery = useOrganizations();
	setOrganizationStore(organizationQuery.data?.data?.[0]);
	const organizationStore = getOrganizationStore();

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown() {
		isOpen = false;
	}

	const selectedOrganization = $derived(organizationStore.organization);
	const filteredOrganizations = $derived(organizationQuery.data?.data);

	$effect(() => {
		console.log("organizationQuery.data", organizationQuery.data);
	});
</script>

<div class="relative">
	<Button
		variant="outline"
		size="xs"
		className="w-full dropdown-toggle !bg-white/[0.03]"
		onClick={toggleDropdown}
	>
		<div class="flex w-full items-center justify-between">
			<p>
				{organizationQuery.isLoading
					? 'Loading...'
					: (selectedOrganization?.name ?? 'No organization selected')}
			</p>

			<svg
				class={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
					isOpen ? 'rotate-180' : ''
				}`}
				width="18"
				height="20"
				viewBox="0 0 18 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	</Button>

	<Dropdown
		{isOpen}
		onClose={closeDropdown}
		className="absolute right-0 mt-[17px] flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
	>
		<ul
			class="flex flex-col gap-1 border-gray-200 {filteredOrganizations?.length &&
			filteredOrganizations?.length > 0
				? 'mb-3 border-b pb-3'
				: ''} dark:border-gray-800"
		>
			{#each filteredOrganizations ?? [] as organization}
				<li>
					<DropdownItem
						onItemClick={() => {
							closeDropdown();
							organizationStore.selectOrganization(organization);
						}}
						className="flex items-center justify-between gap-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
					>
						<div class="flex items-center gap-2">
							<span class="min-w-0 truncate">{organization.name}</span>
							{#if organization.ownerId === $user.data?.user.id}
								<span class="rounded-lg bg-brand-500/10 px-2 py-1 text-xs text-brand-500"
									>Owner</span
								>
							{:else}
								<span class="rounded-lg bg-gray-500/10 px-2 py-1 text-xs text-gray-500">Member</span
								>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							{#if organization.id === selectedOrganization?.id}
								<Check class="h-4 w-4" />
							{/if}
						</div>
					</DropdownItem>
				</li>
			{/each}
		</ul>
		<div class="flex w-full flex-col gap-1">
			<button
				class="group flex items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
				onclick={() => {}}
			>
				<DoorOpen class="h-4 w-4" />
				Join an organization
			</button>
			<button
				class="group flex items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
				onclick={() => {}}
			>
				<Plus class="h-4 w-4" />
				Create an organization
			</button>
		</div>
	</Dropdown>
</div>
