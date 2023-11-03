import { config } from '../../../../shared/config.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

const integrateCpfProccessingReceipts = async function ({ dependencies = { S3ObjectStorageProvider } }) {
  dependencies.S3ObjectStorageProvider.createClient(config.cpf.storage.cpfReceipts.client);
};

export { integrateCpfProccessingReceipts };
