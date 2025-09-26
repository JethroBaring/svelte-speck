import { getContext, setContext } from 'svelte';

type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  title: string;
  message: string
  type: ToastType
  duration?: number
}

export class ToastStore {
	toasts: Toast[] = $state([]);

	constructor() {}

  addToast = (toast: Toast) => {
    this.toasts.push(toast);

    setTimeout(() => {
      this.removeToast(toast.id);
    }, toast.duration || 3000);
  }

  removeToast = (id: string) => {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  clearToasts = () => {
    this.toasts = [];
  } 
}

const TOAST_KEY = Symbol('TOAST');

export function setToastStore() {
	return setContext(TOAST_KEY, new ToastStore());
}

export function getToastStore() {
	return getContext<ReturnType<typeof setToastStore>>(TOAST_KEY);
}