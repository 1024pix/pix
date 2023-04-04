import dotenv from 'dotenv';

dotenv.config();
import perf_hooks from 'perf_hooks';

const { performance } = perf_hooks;

import { logger } from '../lib/infrastructure/logger.js';
import { cache } from '../lib/infrastructure/caches/learning-content-cache.js';
import { knex, disconnect } from '../db/knex-database-connection.js';

async function toggleIsForAbsoluteNoviceCampaignAttribute(campaignId) {
  const campaign = await knex.select('isForAbsoluteNovice').from('campaigns').where({ id: campaignId }).first();
  if (!campaign) {
    return logger.error(`Campaign not found for id ${campaignId}`);
  }
  await knex('campaigns').update({ isForAbsoluteNovice: !campaign.isForAbsoluteNovice }).where({ id: campaignId });
}

import * as url from 'url';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

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

export { toggleIsForAbsoluteNoviceCampaignAttribute };
