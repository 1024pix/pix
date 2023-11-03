import { config } from '../../../../shared/config.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

const uploadCpfFiles = async function ({
  filename,
  readableStream,
  logger,
  dependencies = { S3ObjectStorageProvider },
}) {
  logger.trace('uploadCpfFiles: start upload');
  const s3ObjectStorageProvider = dependencies.S3ObjectStorageProvider.createClient({
    ...config.cpf.storage.cpfExports.client,
    dependencies: { logger },
  });

  await s3ObjectStorageProvider.startUpload({ filename, readableStream });
  logger.trace(`uploadCpfFiles: ${filename} upload done`);
};

export { uploadCpfFiles };
