import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

class DryRunRollback extends Error {}

/**
 * Runs `fn` in a transaction, rolled back at the end when `dryRun` is true.
 * Any other error is rethrown, after the rollback.
 * Must not be nested: within an existing transaction, the dry run could not roll anything back.
 */
export async function executeInTransaction({ dryRun }: { dryRun: boolean }, fn: () => Promise<unknown>): Promise<void> {
  if (DomainTransaction.getConnection().isTransaction) {
    throw new Error('executeInTransaction must not be nested in another transaction');
  }
  try {
    await DomainTransaction.execute(async () => {
      await fn();
      if (dryRun) throw new DryRunRollback();
    });
  } catch (error) {
    if (!(error instanceof DryRunRollback)) throw error;
  }
}
