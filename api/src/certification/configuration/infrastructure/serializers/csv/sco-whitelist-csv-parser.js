import * as fs from 'node:fs/promises';

import { CsvParser } from '../../../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { ScoWhitelistCsvHeader } from './sco-whitelist-csv-header.js';

export const extractExternalIds = async (file) => {
  const buffer = await fs.readFile(file);
  try {
    return _extractIds(buffer).map(({ externalId }) => externalId.trim());
  } finally {
    fs.unlink(file);
  }
};

const _extractIds = (buffer) => {
  const columns = new ScoWhitelistCsvHeader();
  const campaignIdsCsv = new CsvParser(buffer, columns);
  return campaignIdsCsv.parse();
};
