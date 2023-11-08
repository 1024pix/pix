import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { config } from '../../../../shared/config.js';
import { CpfExport } from '../../domain/models/CpfExport.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import dayjs from 'dayjs';
import bluebird from 'bluebird';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../../lib/infrastructure/constants.js';

class CpfExportsStorage {
  #client;

  constructor() {
    this.#client = S3ObjectStorageProvider.createClient(config.cpf.storage.cpfExports.client);
  }

  async findAll() {
    const storageResponse = await this.#client.listFiles();

    if (storageResponse.IsTruncated === true) {
      // Not functional requirement: more than 1K exports to handle at once
      logger.warn('Could not fetch all storage items at once');
    }

    return this.#toDomainArray({ storageFiles: storageResponse.Contents });
  }

  async preSignFiles({ keys, expiresIn }) {
    return bluebird.map(
      keys,
      (key) => {
        return this.#client.preSignFile({ key, expiresIn });
      },
      { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
    );
  }

  #toDomainArray({ storageFiles = [] }) {
    return storageFiles.map((file) => {
      const lastModifiedDate = dayjs(file.LastModified).toDate();
      return new CpfExport({ filename: file.Key, lastModifiedDate });
    });
  }
}

const cpfExportsStorage = new CpfExportsStorage();
export { cpfExportsStorage, CpfExportsStorage };
