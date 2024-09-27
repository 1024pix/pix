import { config } from '../../../../shared/config.js';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../shared/infrastructure/constants.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

class CpfExportsStorage {
  #client;

  constructor() {
    this.#client = S3ObjectStorageProvider.createClient(config.cpf.storage.cpfExports.client);
  }

  async sendFile({ filename, readableStream }) {
    return this.#client.startUpload({ filename, readableStream });
  }

  async preSignFiles({ keys, expiresIn = config.cpf.storage.cpfExports.commands.preSignedExpiresIn }) {
    return PromiseUtils.map(
      keys,
      (key) => {
        return this.#client.preSignFile({ key, expiresIn });
      },
      { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
    );
  }
}

const cpfExportsStorage = new CpfExportsStorage();
export { CpfExportsStorage, cpfExportsStorage };
