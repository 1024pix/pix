import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { config } from '../../../../shared/config.js';
import { CpfReceipt } from '../../domain/models/CpfReceipt.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

class CpfReceiptsStorage {
  #client;

  constructor() {
    this.#client = S3ObjectStorageProvider.createClient(config.cpf.storage.cpfReceipts.client);
  }

  async findAll() {
    const storageResponse = await this.#client.listFiles();

    if (storageResponse.IsTruncated === true) {
      // Not functional requirement: more than 1K receipts to handle at once
      logger.warn('Could not fetch all storage items at once');
    }

    return this.#toDomainArray({ storageFiles: storageResponse.Contents });
  }

  async readFile({ cpfReceipt }) {
    const data = await this.#client.readFile({ key: cpfReceipt.filename });
    //Body from the GetObjectCommand is a ReadableStream
    return data.Body;
  }

  #toDomainArray({ storageFiles = [] }) {
    return storageFiles.map((file) => new CpfReceipt({ filename: file.Key }));
  }
}

const cpfReceiptsStorage = new CpfReceiptsStorage();
export { cpfReceiptsStorage, CpfReceiptsStorage };
