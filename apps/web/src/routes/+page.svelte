<script lang="ts">
	import Modal from '../components/ui/modal/modal.svelte';
	import Label from '../components/ui/label/label.svelte';
	import Input from '../components/ui/input/input.svelte';
	import Button from '../components/ui/button/button.svelte';
	import { useModal } from '../stores/modalStore.svelte';
	import Dropdown from '../components/ui/dropdown/dropdown.svelte';
	import DropdownItem from '../components/ui/dropdown/dropdown-item.svelte';
	import DatePicker from '../components/ui/date-picker/date-picker.svelte';
	const { isOpen, openModal, closeModal } = useModal();
</script>

<div class="h-screen dark:bg-gray-900">
	{isOpen}
	<h1>Welcome to SvelteKit</h1>
	<p>
		Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
	</p>
	<button onclick={openModal}>Open Modal</button>

	<DatePicker id="date-picker" label="Date Picker" />

	<Dropdown isOpen={isOpen.value} onClose={closeModal}>
		<DropdownItem>Test</DropdownItem>
	</Dropdown>
</div>

<!-- <Modal isOpen={isOpen.value} onClose={closeModal} className="max-w-[700px] m-4">
	<form
		onsubmit={() => {}}
		class="relative no-scrollbar w-full overflow-y-auto rounded-xl bg-white p-4 lg:p-11 dark:bg-gray-900"
	>
		<div class="px-2 pr-14">
			<h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
				Create new test case
			</h4>
		</div>
		<div class="flex flex-col gap-6">
			<div class="custom-scrollbar overflow-y-auto px-2">
				<div class="flex flex-col gap-4">
					<div>
						<Label>Name</Label>
						<Input placeholder="Enter test case name" onChange={() => {}} />
					</div>
				</div>
			</div>
			<div class="flex items-center gap-3 px-2 lg:justify-end">
				<Button size="sm" variant="outline" onClick={closeModal}>Cancel</Button>
				<Button size="sm">Create</Button>
			</div>
		</div>
	</form>
</Modal> -->
