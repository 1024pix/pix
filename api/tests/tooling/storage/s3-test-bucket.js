import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { parquetReadObjects } from 'hyparquet';

import { S3ObjectStorageProvider } from '../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

const BUCKET_EXISTS_ERRORS = ['BucketAlreadyOwnedByYou', 'BucketAlreadyExists'];

/**
 * Prepares the bucket of a storage client of the config for a test: creates it
 * on the local S3 if needed, empties it, and gives helpers to read it back.
 *
 * @param {{ accessKeyId: string, secretAccessKey: string, endpoint: string, region: string, bucket: string }} storageClient
 * @returns {Promise<{ keys: () => Promise<string[]>, readParquet: (key: string) => Promise<object[]> }>}
 */
export const prepareTestBucket = async (storageClient) => {
  const rawS3 = new S3Client({
    credentials: { accessKeyId: storageClient.accessKeyId, secretAccessKey: storageClient.secretAccessKey },
    endpoint: storageClient.endpoint,
    region: storageClient.region,
    forcePathStyle: true,
  });
  try {
    await rawS3.send(new CreateBucketCommand({ Bucket: storageClient.bucket }));
  } catch (error) {
    if (!BUCKET_EXISTS_ERRORS.includes(error.name)) throw error;
  }

  const client = S3ObjectStorageProvider.createClient(storageClient);

  /** The keys of the bucket, sorted. */
  const keys = async () => {
    const { Contents: files } = await client.listFiles();
    return (files ?? []).map(({ Key }) => Key).toSorted();
  };

  /** The rows of the parquet file at the key. */
  const readParquet = async (key) => {
    const { Body } = await client.readFile({ key });
    const bytes = await Body.transformToByteArray();
    return parquetReadObjects({ file: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  };

  for (const key of await keys()) {
    await client.deleteFile({ key });
  }

  return { keys, readParquet };
};
