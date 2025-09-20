import type { Writable } from 'svelte/store';

export type TabsIndicatorStyle = { left: number; width: number };

export type TabsContext = {
  value: Writable<string>;
  setValue: (next: string) => void;
  navRef: Writable<HTMLElement | null>;
  setNavRef: (el: HTMLElement | null) => void;
  activeTriggerEl: Writable<HTMLButtonElement | null>;
  registerActiveTrigger: (el: HTMLButtonElement | null) => void;
  indicator: Writable<TabsIndicatorStyle>;
  setIndicatorStyle: (style: TabsIndicatorStyle) => void;
};

export const TABS_CTX = Symbol('tabs-context');


