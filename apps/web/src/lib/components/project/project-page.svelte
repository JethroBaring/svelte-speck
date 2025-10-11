<script lang="ts">
	import MainSection from './main-section/main-section.svelte';
	import ProjectRightSidebar from './right-sidebar/project-right-sidebar.svelte';
	import CreateTestSuiteModal from '../test-suite/create-test-suite-modal.svelte';
	import { setModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { CREATE_TEST_SUITE_MODAL_KEY } from '$lib/constants/modal-keys';

	setModalStore(CREATE_TEST_SUITE_MODAL_KEY);
</script>

<div class="flex h-full w-full">
	<MainSection />
	<ProjectRightSidebar projectId="1" />
</div>
<CreateTestSuiteModal />
