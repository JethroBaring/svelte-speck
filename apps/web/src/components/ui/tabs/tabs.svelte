<script lang="ts">
import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import { TABS_CTX, type TabsIndicatorStyle, type TabsContext } from './context';
import type { Snippet } from 'svelte';

interface TabsProps {
  value?: string;
  defaultValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  children?: Snippet;
}

let { value, defaultValue, className = '', onValueChange, children }: TabsProps = $props();

const valueStore = writable<string>(value ?? defaultValue ?? '');
const navRefStore = writable<HTMLElement | null>(null);
const activeTriggerStore = writable<HTMLButtonElement | null>(null);
const indicatorStore = writable<TabsIndicatorStyle>({ left: 0, width: 0 });

function setValue(next: string) {
  valueStore.set(next);
  onValueChange?.(next);
}

function setNavRef(el: HTMLElement | null) {
  navRefStore.set(el);
}

function registerActiveTrigger(el: HTMLButtonElement | null) {
  activeTriggerStore.set(el);
}

function setIndicatorStyle(style: TabsIndicatorStyle) {
  indicatorStore.set(style);
}

setContext<TabsContext>(TABS_CTX, {
  value: valueStore,
  setValue,
  navRef: navRefStore,
  setNavRef,
  activeTriggerEl: activeTriggerStore,
  registerActiveTrigger,
  indicator: indicatorStore,
  setIndicatorStyle
});
</script>

<div class={className}>
  {@render children?.()}
</div>

 
