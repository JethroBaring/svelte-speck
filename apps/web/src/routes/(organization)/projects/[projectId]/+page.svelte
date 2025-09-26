<script lang="ts">
	import { Project } from '@/lib/components/projects';
	import { setModalStore } from '@/lib/stores/ui/modal-store.svelte';

	interface ProjectPageProps {
		data: {
			projectId: string;
		};
	}

	let { data }: ProjectPageProps = $props();

</script>

<Project projectId={data.projectId} />
