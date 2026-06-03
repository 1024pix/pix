import fs from "node:fs";
import { config } from "../../../api/src/shared/config.js";
import { S3ObjectStorageProvider } from "../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js";
import { logger } from "../../src/shared/infrastructure/utils/logger.js";
import { FileValidationError } from "../../src/shared/domain/errors.js";

export class AnswersHistoryExportStorage {
  #client;

  constructor() {
    this.#client = S3ObjectStorageProvider.createClient(
      config.answersHistory.storage.client,
    );
  }

  async sendFile({ filename, filepath }) {
    let readableStream;
    try {
      readableStream = fs.createReadStream(filepath);
      readableStream.on("error", function (error) {
        throw error;
      });
    } catch (error) {
      logger.error(error);
      throw new FileValidationError("INVALID_FILE");
    }
    return this.#client.startUpload({ filename, readableStream });
  }
}
