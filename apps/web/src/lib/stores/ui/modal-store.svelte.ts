import { setContext, getContext } from 'svelte';

export class ModalStore {
	isOpen = $state(false);

	open() {
		this.isOpen = true;
	}

	close() {
		this.isOpen = false;
	}
}

export function setModalStore(key: symbol) {
	return setContext(key, new ModalStore());
}

export function getModalStore(key: symbol) {
	return getContext<ModalStore>(key);
}
