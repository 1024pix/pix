/**
 * Exports to the data lake the knowledge elements produced by migrated users:
 * the rows not exported yet go to parquet files, and get their `savedAt`. The
 * exported rows are purged later by another job.
 *
 * The data lake partitions the knowledge elements by day of creation, in
 * Paris time, and catches up a day by replacing it, so a file is in the folder
 * of one day and holds rows created on that day only: a page of rows gives one
 * file per day it spans. The rows are created and numbered by the same save,
 * so a page spans two days only around midnight.
 *
 * Each file is recorded before its upload, and completed after it, in the
 * transaction dating the save of its rows. A run starts by writing again, to their
 * recorded name, the files left incomplete by a previous run, whether that run
 * stopped before or after the upload: a row is in one file.
 *
 * The record of a file must be committed before its upload, so the use case
 * refuses to run inside a transaction: a rollback would leave uploaded files
 * that nothing records.
 */
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import type * as MigratedUserKnowledgeElementRepository from '../../../shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { dayBounds, toDay } from '../../../shared/infrastructure/utils/date-utils.ts';
import { logger as defaultLogger } from '../../../shared/infrastructure/utils/logger.js';
import type * as MigratedUserKnowledgeElementExportFileRepository from '../../infrastructure/repositories/migrated-user-knowledge-element-export-file-repository.ts';
import type * as MigratedUserKnowledgeElementExportRepository from '../../infrastructure/repositories/migrated-user-knowledge-element-export-repository.ts';

/** The timezone of the days partitioning the data lake. */
const DATA_LAKE_TIMEZONE = 'Europe/Paris';

export const exportMigratedUserKnowledgeElements = async ({
  batchSize,
  migratedUserKnowledgeElementRepository,
  migratedUserKnowledgeElementExportFileRepository,
  migratedUserKnowledgeElementExportRepository,
  logger = defaultLogger,
}: {
  batchSize: number;
  migratedUserKnowledgeElementRepository: typeof MigratedUserKnowledgeElementRepository;
  migratedUserKnowledgeElementExportFileRepository: typeof MigratedUserKnowledgeElementExportFileRepository;
  migratedUserKnowledgeElementExportRepository: typeof MigratedUserKnowledgeElementExportRepository;
  logger?: typeof defaultLogger;
}): Promise<void> => {
  if (DomainTransaction.getConnection().isTransaction) {
    throw new Error('The export of migrated user knowledge elements cannot run inside a transaction');
  }

  const at = new Date();

  // First, the files left incomplete by a previous run are written again, with their rows still not exported.
  for (const file of await migratedUserKnowledgeElementExportFileRepository.findPending()) {
    const day = migratedUserKnowledgeElementExportRepository.dayOf(file.filename);
    const { start, end } = dayBounds(day, DATA_LAKE_TIMEZONE);
    const rows = await migratedUserKnowledgeElementRepository.findUnsavedInRange(file.firstId, file.lastId, start, end);
    logger.warn(`Export file ${file.filename} was not completed by a previous run: written again`);

    if (rows.length > 0) {
      await migratedUserKnowledgeElementExportRepository.sendFile(file.filename, rows);
    }
    await DomainTransaction.execute(async () => {
      await migratedUserKnowledgeElementRepository.setSavedAt(
        rows.map(({ id }) => id),
        at,
      );
      await migratedUserKnowledgeElementExportFileRepository.complete(file.id, rows.length, at);
    });
    logger.info(`${rows.length} migrated user knowledge elements exported to ${file.filename}`);
  }

  // Then, the rows not exported yet go, page by page, to one file per day of creation.
  const exportPages = async (afterId: number): Promise<void> => {
    const page = await migratedUserKnowledgeElementRepository.findUnsaved(afterId, batchSize);
    const lastRowOfPage = page.at(-1);
    if (!lastRowOfPage) return;

    for (const [day, rows] of Map.groupBy(page, ({ createdAt }) => toDay(createdAt, DATA_LAKE_TIMEZONE))) {
      const [firstRow] = rows;
      const lastRow = rows.at(-1);

      if (!firstRow || !lastRow) continue;

      const file = await migratedUserKnowledgeElementExportFileRepository.create(
        migratedUserKnowledgeElementExportRepository.fileName(day, firstRow.id, lastRow.id),
        firstRow.id,
        lastRow.id,
        rows.length,
      );

      await migratedUserKnowledgeElementExportRepository.sendFile(file.filename, rows);
      await DomainTransaction.execute(async () => {
        await migratedUserKnowledgeElementRepository.setSavedAt(
          rows.map(({ id }) => id),
          at,
        );
        await migratedUserKnowledgeElementExportFileRepository.complete(file.id, rows.length, at);
      });
      logger.info(`${rows.length} migrated user knowledge elements exported to ${file.filename}`);
    }

    return exportPages(lastRowOfPage.id);
  };

  await exportPages(0);
};
