import { config } from '../../../../../lib/config.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
const { cpf } = config;

const uploadCpfFiles = async function ({
  filename,
  readableStream,
  logger,
  dependencies = { S3ObjectStorageProvider },
}) {
  logger.trace('uploadCpfFiles: start upload');
  const s3ObjectStorageProvider = dependencies.S3ObjectStorageProvider.createClient({
    ...cpf.storage,
    dependencies: { logger },
  });

  await s3ObjectStorageProvider.startUpload({ filename, readableStream });
  logger.trace(`uploadCpfFiles: ${filename} upload done`);
};

export { uploadCpfFiles };
