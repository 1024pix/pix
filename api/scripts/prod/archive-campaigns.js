const { parseCsvWithHeader } = require('../helpers/csvHelpers');
const archiveCampaignFromCampaignCode = require('../../lib/domain/usecases/archive-campaign-from-campaign-code');
const campaignForArchivingRepository = require('../../lib/infrastructure/repositories/campaign/campaign-for-archiving-repository');
const bluebird = require('bluebird');
const ProgressionLogger = require('../../lib/infrastructure/utils/progression-logger');
const { disconnect } = require('../../db/knex-database-connection');

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

const isLaunchedFromCommandLine = require.main === module;

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

module.exports = archiveCampaigns;
