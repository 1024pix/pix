import { createReadStream } from 'node:fs';
import * as fs from 'node:fs/promises';

import { FileValidationError } from '../../../../../shared/domain/errors.js';
import { CsvParser } from '../../../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { getDataBuffer } from '../../../../../shared/infrastructure/utils/buffer.js';
import { logger } from '../../../../../shared/infrastructure/utils/logger.js';
import { ScoWhitelistCsvHeader } from './sco-whitelist-csv-header.js';

export const extractExternalIds = async (file) => {
  const stream = createReadStream(file);
  const buffer = await getDataBuffer(stream);
  try {
    return _extractIds(buffer).map(({ externalId }) => externalId.trim());
  } catch (error) {
    logger.error(error);
    throw new FileValidationError();
  } finally {
    fs.unlink(file);
  }
};

const _extractIds = (buffer) => {
  const columns = new ScoWhitelistCsvHeader();
  const campaignIdsCsv = new CsvParser(buffer, columns);
  return campaignIdsCsv.parse();
};
