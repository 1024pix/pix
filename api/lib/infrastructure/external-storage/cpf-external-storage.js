import { S3ObjectStorageProvider } from './s3-utils.js';
import { config } from '../../config.js';
import { logger } from '../logger.js';
const { cpf } = config;

const upload = async function ({ filename, readableStream, dependencies = { S3ObjectStorageProvider, logger } }) {
  dependencies.logger.trace('cpfExternalStorage: start upload');

  const upload = dependencies.S3ObjectStorageProvider.createClient(cpf.storage).startUpload({
    filename,
    readableStream,
  });

  upload.on('httpUploadProgress', (progress) => dependencies.logger.trace(progress));

  await upload.done();
  dependencies.logger.trace(`cpfExternalStorage: ${filename} upload done`);
};

const getPreSignUrlsOfFilesModifiedAfter = async function ({ date, dependencies = { S3ObjectStorageProvider } }) {
  const s3ObjectStorageProvider = dependencies.S3ObjectStorageProvider.createClient(cpf.storage);
  const filesInBucket = await s3ObjectStorageProvider.listFiles();

  const keysOfFilesModifiedAfter = filesInBucket?.Contents.filter(({ LastModified }) => LastModified >= date).map(
    ({ Key }) => Key,
  );

  return await s3ObjectStorageProvider.preSignFiles({
    keys: keysOfFilesModifiedAfter,
    expiresIn: cpf.storage.preSignedExpiresIn,
  });
};

export { upload, getPreSignUrlsOfFilesModifiedAfter };
