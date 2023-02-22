import dotenv from 'dotenv';
dotenv.config();
import * as url from 'url';
import { performance } from 'perf_hooks';
import logger from '../lib/infrastructure/logger';
import cache from '../lib/infrastructure/caches/learning-content-cache';
import { knex, disconnect } from '../db/knex-database-connection';

const __filename = url.fileURLToPath(import.meta.url);

async function toggleIsForAbsoluteNoviceCampaignAttribute(campaignId) {
  const campaign = await knex.select('isForAbsoluteNovice').from('campaigns').where({ id: campaignId }).first();
  if (!campaign) {
    return logger.error(`Campaign not found for id ${campaignId}`);
  }
  await knex('campaigns').update({ isForAbsoluteNovice: !campaign.isForAbsoluteNovice }).where({ id: campaignId });
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const campaignId = process.argv[2];
  await toggleIsForAbsoluteNoviceCampaignAttribute(campaignId);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      await cache.quit();
    }
  }
})();

export default { toggleIsForAbsoluteNoviceCampaignAttribute };
