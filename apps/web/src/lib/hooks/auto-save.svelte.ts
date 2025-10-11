export type AutosaveOptions = {
  delayMs?: number;
  enabled?: boolean;
};

export type AutosaveState = {
  isSaving: boolean;
  lastSavedAt: number | null;
  error: Error | null;
  flush: () => Promise<void>;
  cancel: () => void;
};

export function useAutosave<T>(
  getValue: () => T,
  save: (value: T, signal: AbortSignal) => Promise<void>,
  options?: AutosaveOptions
): AutosaveState {
  const delayMs = options?.delayMs ?? 800;
  const enabled = options?.enabled ?? true;

  let timeoutId: number | null = null;
  let abortController: AbortController | null = null;
  let latestValue: T;
  
  let isSaving = $state(false);
  let lastSavedAt = $state<number | null>(null);
  let error = $state<Error | null>(null);

  async function runSave() {
    if (!enabled) return;

    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    abortController = controller;
    isSaving = true;
    error = null;

    try {
      await save(latestValue, controller.signal);
      lastSavedAt = Date.now();
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        error = e instanceof Error ? e : new Error(String(e));
      }
    } finally {
      isSaving = false;
      if (abortController === controller) {
        abortController = null;
      }
    }
  }

  function cancel() {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  }

  async function flush() {
    if (!enabled) return;

    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    await runSave();
  }

  // Track value changes and trigger autosave
  $effect.pre(() => {
    // Clear any pending timeout before tracking the new value
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  });

  $effect(() => {
    const value = getValue();
    latestValue = value;

    if (!enabled) return;

    timeoutId = window.setTimeout(() => {
      void runSave();
    }, delayMs);
  });

  // Cleanup on destroy
  $effect(() => () => cancel());

  return {
    get isSaving() { return isSaving; },
    get lastSavedAt() { return lastSavedAt; },
    get error() { return error; },
    flush,
    cancel
  };
}