import * as url from 'node:url';

import bluebird from 'bluebird';

import { disconnect } from '../../db/knex-database-connection.js';
import { archiveCampaignFromCampaignCode } from '../../lib/domain/usecases/archive-campaign-from-campaign-code.js';
import { ProgressionLogger } from '../../lib/infrastructure/utils/progression-logger.js';
import * as campaignForArchivingRepository from '../../src/prescription/campaign/infrastructure/repositories/campaign-for-archiving-repository.js';
import { parseCsvWithHeader } from '../helpers/csvHelpers.js';

async function archiveCampaign(campaignData, logger) {
  try {
    await archiveCampaignFromCampaignCode({
      campaignCode: campaignData.code,
      userId: campaignData.userId,
      campaignForArchivingRepository,
    });
  } catch (error) {
    logger.log('');
    logger.log(`campaign ${campaignData.code} cannot be archived !`);
    logger.log(error.message);
  } finally {
    logger.logCount();
  }
}

async function archiveCampaigns(file, logger, concurrency = 1) {
  const data = await parseCsvWithHeader(file);
  logger.setTotal(data.length);
  await bluebird.mapSeries(data, (campaignData) => archiveCampaign(campaignData, logger), { concurrency });
  logger.log('');
  logger.log('DONE');
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const logger = new ProgressionLogger(process.stdout);
  await archiveCampaigns(process.argv[2], logger, process.argv[3]);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { archiveCampaigns };
