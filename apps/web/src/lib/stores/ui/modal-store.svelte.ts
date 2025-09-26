import { setContext, getContext } from 'svelte';

export class ModalStore {
	isOpen = $state(false);

	openModal = () => {
		this.isOpen = true;
		console.log('openModal', this.isOpen);
	}

	closeModal = () => {
		this.isOpen = false;
	}
}

export function setModalStore(key: symbol) {
	return setContext(key, new ModalStore());
}

export function getModalStore<T = ModalStore>(key: symbol) {
	return getContext<T>(key);
}