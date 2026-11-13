/** The files of the export of the knowledge elements of migrated users, on the bucket of the data lake. */
import { Readable } from 'node:stream';

import { parquetWriteBuffer } from 'hyparquet-writer';

import { config } from '../../../../config/config.js';
import type { MigratedUserKnowledgeElementRow } from '../../../shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { S3ObjectStorageProvider } from '../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

export const FILE_PREFIX = 'migrated-user-knowledge-elements/';

const ID_WIDTH = 12;

const storage: { client?: ReturnType<typeof S3ObjectStorageProvider.createClient> } = {};

/** The client of the bucket, created on the first upload and shared by the next ones. */
const getClient = () =>
  (storage.client ??= S3ObjectStorageProvider.createClient(config.migratedUserKnowledgeElementsExport.storage.client));

const FILE_NAME_PATTERN = new RegExp(
  `^${FILE_PREFIX}(\\d{4})/(\\d{2})/(\\d{2})/\\d{${ID_WIDTH}}_\\d{${ID_WIDTH}}\\.parquet$`,
);

/**
 * The name of a file, in the folder of the day its rows were created, in Paris
 * time, from the ids of its first and last rows, padded so that the files list
 * in the order of the ids. The data lake partitions the knowledge elements by
 * day of creation, so a file holds rows of one day only. A file retried after
 * a failure gets the same name, and is rewritten instead of added.
 */
export const fileName = (day: string, firstId: number, lastId: number): string =>
  `${FILE_PREFIX}${day.replaceAll('-', '/')}/${String(firstId).padStart(ID_WIDTH, '0')}_${String(lastId).padStart(ID_WIDTH, '0')}.parquet`;

/** The day of the rows of a file, read back from its name. */
export const dayOf = (filename: string): string => {
  const match = FILE_NAME_PATTERN.exec(filename);
  if (!match) throw new Error(`The export file ${filename} does not name the day of its rows`);
  const [, year, month, dayOfMonth] = match;

  return `${year}-${month}-${dayOfMonth}`;
};

const toParquet = (rows: MigratedUserKnowledgeElementRow[]): ArrayBuffer =>
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
    ],
  });

/** Uploads the rows as a parquet file of the given name, replacing a file of that name. */
export const sendFile = async (filename: string, rows: MigratedUserKnowledgeElementRow[]): Promise<void> => {
  await getClient().startUpload({ filename, readableStream: Readable.from(Buffer.from(toParquet(rows))) });
};
