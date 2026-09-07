import { config } from '../../../../config/config.js';
import { S3UploadError } from '../../../shared/domain/errors.js';
import { S3ObjectStorageProvider } from '../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

class AttestationStorage extends S3ObjectStorageProvider {
  static createClient() {
    return new AttestationStorage(config.attestations.storage.client);
  }
  async startUpload() {
    try {
      return await super.startUpload(...arguments);
    } catch (error) {
      throw new S3UploadError(error.message);
    }
  }
}

export { AttestationStorage };
