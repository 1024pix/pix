/** The files of the export of the knowledge elements of migrated users, on the bucket of the data lake. */
import { Readable } from 'node:stream';

import { config } from '../../../../config/config.js';
import { S3ObjectStorageProvider } from '../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

export const FILE_PREFIX = 'migrated-user-knowledge-elements/';

const ID_WIDTH = 12;

const client = S3ObjectStorageProvider.createClient(config.migratedUserKnowledgeElementsExport.storage.client);

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

export const sendFile = async (filename: string, fileContent: ArrayBuffer): Promise<void> => {
  await client.startUpload({ filename, readableStream: Readable.from(Buffer.from(fileContent)) });
};
