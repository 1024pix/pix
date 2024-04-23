import * as fs from 'node:fs/promises';

import { CsvParser } from '../../../../../../lib/infrastructure/serializers/csv/csv-parser.js';
import { CampaignIdsCsvHeader } from './campaign-ids-csv-header.js';

async function extractCampaignsIds(file) {
  const buffer = await fs.readFile(file);
  let campaignIds;
  try {
    campaignIds = _extractIds(buffer);
  } catch (error) {
    fs.unlink(file);
    throw error;
  }
  fs.unlink(file);
  return campaignIds.map(({ campaignId }) => parseInt(campaignId));
}

function _extractIds(buffer) {
  const columns = new CampaignIdsCsvHeader();
  const campaignIdsCsv = new CsvParser(buffer, columns);
  return campaignIdsCsv.parse();
}
export { extractCampaignsIds };
