import { config } from '../../../../../lib/config.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

const getPreSignedUrls = async function ({ date, dependencies = { S3ObjectStorageProvider } }) {
  const s3ObjectStorageProvider = dependencies.S3ObjectStorageProvider.createClient(
    config.cpf.storage.cpfExports.client,
  );
  const filesInBucket = await s3ObjectStorageProvider.listFiles();

  const keysOfFilesModifiedAfter = filesInBucket?.Contents.filter(({ LastModified }) => LastModified >= date).map(
    ({ Key }) => Key,
  );

  return s3ObjectStorageProvider.preSignFiles({
    keys: keysOfFilesModifiedAfter,
    expiresIn: config.cpf.storage.cpfExports.commands.preSignedExpiresIn,
  });
};

export { getPreSignedUrls };
