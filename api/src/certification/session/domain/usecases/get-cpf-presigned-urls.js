import { config } from '../../../../../lib/config.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

const { cpf } = config;

const getPreSignedUrls = async function ({ date, dependencies = { S3ObjectStorageProvider } }) {
  const s3ObjectStorageProvider = dependencies.S3ObjectStorageProvider.createClient(cpf.storage);
  const filesInBucket = await s3ObjectStorageProvider.listFiles();

  const keysOfFilesModifiedAfter = filesInBucket?.Contents.filter(({ LastModified }) => LastModified >= date).map(
    ({ Key }) => Key,
  );

  return s3ObjectStorageProvider.preSignFiles({
    keys: keysOfFilesModifiedAfter,
    expiresIn: cpf.storage.preSignedExpiresIn,
  });
};

export { getPreSignedUrls };
