/**
 * Exports to the data lake the knowledge elements produced by migrated users:
 * the rows not exported yet go to parquet files, and get their `savedAt`. The
 * exported rows are purged later by another job.
 *
 * The data lake partitions the knowledge elements by day of creation, in
 * Paris time, and catches up a day by replacing it, so a file is in the folder
 * of one day and holds rows created on that day only: a page of rows gives one
 * file per day it spans. The rows are created and numbered by the same save,
 * so a page spans two days only around midnight. A file is never uploaded
 * with a row of another day: such a row would be lost when its day is
 * replaced, and would be one too many in the day of the file.
 *
 * Each file is recorded before its upload, and completed after it, in the
 * transaction dating the save of its rows. A run starts by writing again, to their
 * recorded name, the files left incomplete by a previous run, whether that run
 * stopped before or after the upload: a row is in one file.
 */
import { parquetWriteBuffer } from 'hyparquet-writer';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import type * as MigratedUserKnowledgeElementRepository from '../../../shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import type { MigratedUserKnowledgeElementRow } from '../../../shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { dayBounds, toDay } from '../../../shared/infrastructure/utils/date-utils.ts';
import { logger as defaultLogger } from '../../../shared/infrastructure/utils/logger.js';
import type * as MigratedUserKnowledgeElementExportFileRepository from '../../infrastructure/repositories/migrated-user-knowledge-element-export-file-repository.ts';
import type { MigratedUserKnowledgeElementExportFile } from '../../infrastructure/repositories/migrated-user-knowledge-element-export-file-repository.ts';
import type * as MigratedUserKnowledgeElementExportRepository from '../../infrastructure/repositories/migrated-user-knowledge-element-export-repository.ts';

/** The timezone of the days partitioning the data lake. */
const DATA_LAKE_TIMEZONE = 'Europe/Paris';

const toParquet = (rows: MigratedUserKnowledgeElementRow[], extractedAt: string): ArrayBuffer =>
  parquetWriteBuffer({
    columnData: [
      { name: 'id', type: 'INT64', data: rows.map(({ id }) => BigInt(id)) },
      { name: 'source', type: 'STRING', data: rows.map(({ source }) => source) },
      { name: 'status', type: 'STRING', data: rows.map(({ status }) => status) },
      { name: 'createdAt', type: 'TIMESTAMP', data: rows.map(({ createdAt }) => createdAt) },
      {
        name: 'answerId',
        type: 'INT64',
        nullable: true,
        data: rows.map(({ answerId }) => answerId && BigInt(answerId)),
      },
      { name: 'assessmentId', type: 'INT32', nullable: true, data: rows.map(({ assessmentId }) => assessmentId) },
      { name: 'skillId', type: 'STRING', data: rows.map(({ skillId }) => skillId) },
      { name: 'earnedPix', type: 'DOUBLE', data: rows.map(({ earnedPix }) => earnedPix) },
      { name: 'userId', type: 'INT32', data: rows.map(({ userId }) => userId) },
      { name: 'competenceId', type: 'STRING', data: rows.map(({ competenceId }) => competenceId) },
      { name: 'extractedAt', type: 'STRING', data: rows.map(() => extractedAt) },
    ],
  });

/** Gives the number of exported rows. */
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
}): Promise<number> => {
  const at = new Date();
  const extractedAt = toDay(at, DATA_LAKE_TIMEZONE);

  const dayBoundsOf = (file: MigratedUserKnowledgeElementExportFile): { start: Date; end: Date } =>
    dayBounds(migratedUserKnowledgeElementExportRepository.dayOf(file.filename), DATA_LAKE_TIMEZONE);

  const assertRowsOfDay = (file: MigratedUserKnowledgeElementExportFile, rows: MigratedUserKnowledgeElementRow[]) => {
    const { start, end } = dayBoundsOf(file);
    const strayRow = rows.find(({ createdAt }) => createdAt < start || createdAt >= end);
    if (strayRow) {
      throw new Error(
        `The knowledge element ${strayRow.id}, created on ${toDay(strayRow.createdAt, DATA_LAKE_TIMEZONE)}, cannot go to the file ${file.filename}`,
      );
    }
  };

  const writeFile = async (
    file: MigratedUserKnowledgeElementExportFile,
    rows: MigratedUserKnowledgeElementRow[],
  ): Promise<void> => {
    assertRowsOfDay(file, rows);
    if (rows.length > 0) {
      await migratedUserKnowledgeElementExportRepository.sendFile(file.filename, toParquet(rows, extractedAt));
    }
    await DomainTransaction.execute(async () => {
      await migratedUserKnowledgeElementRepository.setSavedAt(
        rows.map(({ id }) => id),
        at,
      );
      await migratedUserKnowledgeElementExportFileRepository.complete(file.id, rows.length, at);
    });
    logger.info(`${rows.length} migrated user knowledge elements exported to ${file.filename}`);
  };

  const writePendingFile = async (file: MigratedUserKnowledgeElementExportFile): Promise<number> => {
    const { start, end } = dayBoundsOf(file);
    const rows = await migratedUserKnowledgeElementRepository.findUnsavedInRange(file.firstId, file.lastId, start, end);
    logger.warn(`Export file ${file.filename} was not completed by a previous run: written again`);
    await writeFile(file, rows);

    return rows.length;
  };

  const writePendingFiles = async (
    [file, ...others]: MigratedUserKnowledgeElementExportFile[],
    writtenCount: number,
  ): Promise<number> =>
    file ? writePendingFiles(others, writtenCount + (await writePendingFile(file))) : writtenCount;

  const exportFile = async (day: string, rows: MigratedUserKnowledgeElementRow[]): Promise<void> => {
    const [firstRow] = rows;
    const lastRow = rows.at(-1);
    if (!firstRow || !lastRow) return;

    const file = await migratedUserKnowledgeElementExportFileRepository.create(
      migratedUserKnowledgeElementExportRepository.fileName(day, firstRow.id, lastRow.id),
      firstRow.id,
      lastRow.id,
      rows.length,
    );
    await writeFile(file, rows);
  };

  const exportPage = async (rows: MigratedUserKnowledgeElementRow[]): Promise<void> => {
    for (const [day, rowsOfDay] of Map.groupBy(rows, ({ createdAt }) => toDay(createdAt, DATA_LAKE_TIMEZONE))) {
      await exportFile(day, rowsOfDay);
    }
  };

  const exportPages = async (afterId: number, exportedCount: number): Promise<number> => {
    const rows = await migratedUserKnowledgeElementRepository.findUnsaved(afterId, batchSize);
    const lastRow = rows.at(-1);
    if (!lastRow) return exportedCount;

    await exportPage(rows);

    return exportPages(lastRow.id, exportedCount + rows.length);
  };

  const recoveredCount = await writePendingFiles(
    await migratedUserKnowledgeElementExportFileRepository.findPending(),
    0,
  );
  const exportedCount = await exportPages(0, recoveredCount);
  logger.info(`${exportedCount} migrated user knowledge elements exported`);

  return exportedCount;
};
