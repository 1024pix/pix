import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { config } from '../../../../../lib/config.js';
import { logger } from '../../../../../lib/infrastructure/logger.js';

const { cpf } = config;

const upload = async function ({ filename, readableStream, dependencies = { S3ObjectStorageProvider, logger } }) {
  dependencies.logger.trace('uploadCpfFiles: start upload');

  const upload = dependencies.S3ObjectStorageProvider.createClient(cpf.storage).startUpload({
    filename,
    readableStream,
  });

  upload.on('httpUploadProgress', (progress) => dependencies.logger.trace(progress));

  await upload.done();
  dependencies.logger.trace(`uploadCpfFiles: ${filename} upload done`);
};

export { upload };
