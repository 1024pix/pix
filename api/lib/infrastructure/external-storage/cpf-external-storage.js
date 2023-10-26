import * as s3Utils from './s3-utils.js';
import { config } from '../../config.js';
import { logger } from '../logger.js';
const { cpf } = config;

const upload = async function ({ filename, readableStream, dependencies = { s3Utils, logger } }) {
  dependencies.logger.trace('cpfExternalStorage: start upload');

  const { accessKeyId, secretAccessKey, endpoint, region, bucket } = cpf.storage;
  const s3ObjectStorageProvider = new dependencies.s3Utils.S3ObjectStorageProvider({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region,
    bucket,
  });

  const upload = s3ObjectStorageProvider.startUpload({ filename, readableStream });

  upload.on('httpUploadProgress', (progress) => dependencies.logger.trace(progress));

  await upload.done();
  dependencies.logger.trace(`cpfExternalStorage: ${filename} upload done`);
};

const getPreSignUrlsOfFilesModifiedAfter = async function ({ date, dependencies = { s3Utils } }) {
  const { accessKeyId, secretAccessKey, endpoint, region, bucket, preSignedExpiresIn: expiresIn } = cpf.storage;
  const s3ObjectStorageProvider = new dependencies.s3Utils.S3ObjectStorageProvider({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region,
    bucket,
  });

  const filesInBucket = await s3ObjectStorageProvider.listFiles();

  const keysOfFilesModifiedAfter = filesInBucket?.Contents.filter(({ LastModified }) => LastModified >= date).map(
    ({ Key }) => Key,
  );

  return await s3ObjectStorageProvider.preSignFiles({
    keys: keysOfFilesModifiedAfter,
    expiresIn,
  });
};

export { upload, getPreSignUrlsOfFilesModifiedAfter };
