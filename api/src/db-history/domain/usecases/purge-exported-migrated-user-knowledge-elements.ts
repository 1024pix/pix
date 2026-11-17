/**
 * Purges the knowledge elements of migrated users once the data lake has them:
 * a row is deleted once its export is older than the retention period (7 days
 * by default), batch by batch.
 *
 * A row gets its `savedAt` in the transaction completing its file, so a row
 * not exported, or whose export did not complete, is never purged.
 */
import type * as MigratedUserKnowledgeElementRepository from '../../../shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { logger as defaultLogger } from '../../../shared/infrastructure/utils/logger.js';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export const purgeExportedMigratedUserKnowledgeElements = async ({
  retentionDays,
  batchSize,
  migratedUserKnowledgeElementRepository,
  logger = defaultLogger,
}: {
  retentionDays: number;
  batchSize: number;
  migratedUserKnowledgeElementRepository: Pick<typeof MigratedUserKnowledgeElementRepository, 'deleteSavedBefore'>;
  logger?: Pick<typeof defaultLogger, 'info'>;
}): Promise<void> => {
  const savedBefore = new Date(Date.now() - retentionDays * DAY_IN_MILLISECONDS);

  const purgeBatches = async (purgedCount: number): Promise<number> => {
    const deletedCount = await migratedUserKnowledgeElementRepository.deleteSavedBefore(savedBefore, batchSize);
    const newPurgedCount = purgedCount + deletedCount;

    return deletedCount < batchSize ? newPurgedCount : purgeBatches(newPurgedCount);
  };

  const purgedCount = await purgeBatches(0);
  logger.info(`${purgedCount} exported migrated user knowledge elements purged`);
};
