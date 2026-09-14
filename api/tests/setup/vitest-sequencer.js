import { BaseSequencer } from 'vitest/node';

/**
 * Runs test files in a stable alphabetical order.
 *
 * Vitest's default sequencer sorts files by their duration from a previous run, kept in a
 * cache, so that slow files start first. That is a good default for a parallel suite, but it
 * makes the order differ from one run to the next — and this suite shares a single database,
 * so a handful of tests silently depend on what ran before them. A varying order turns those
 * into failures that appear and disappear between runs.
 *
 * Mocha ran the files in glob expansion order, which is alphabetical and stable. Keeping that
 * order means the runner swap does not change which tests run after which, and makes any
 * failure reproducible.
 *
 * Ordering assumptions in the suite are a real problem, but an independent one: they are
 * exposed deliberately with `--sequence.shuffle --sequence.seed=<n>`, not by an order that
 * quietly changes underfoot.
 */
export class AlphabeticalSequencer extends BaseSequencer {
  async sort(files) {
    return [...files].sort((a, b) => a.moduleId.localeCompare(b.moduleId));
  }
}
