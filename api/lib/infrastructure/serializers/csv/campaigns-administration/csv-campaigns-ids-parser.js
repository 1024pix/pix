import { promises as fs } from 'fs';
import { CsvParser } from '../csv-parser';
import ArchiveCampaignColumn from './campaign-ids-csv-header';

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
  const columns = new ArchiveCampaignColumn();
  const campaignIdsCsv = new CsvParser(buffer, columns);
  return campaignIdsCsv.parse();
}

export default {
  extractCampaignsIds,
};
