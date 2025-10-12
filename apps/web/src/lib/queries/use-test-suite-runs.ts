import { getLatestTestSuiteRun, runTestSuite } from "$lib/api/test-suite-runs";
import { createMutation, createQuery } from "@tanstack/svelte-query";

export function useRunTestSuite(testSuiteId: string) {
  return createMutation(() => ({
    mutationFn: () => runTestSuite(testSuiteId),
  }));
}

export function useLatestTestSuiteRun(testSuiteId: string) {
  return createQuery(() => ({
    queryKey: ['test-suite-runs', 'latest-run', testSuiteId],
    queryFn: () => getLatestTestSuiteRun(testSuiteId),
  }));
}
