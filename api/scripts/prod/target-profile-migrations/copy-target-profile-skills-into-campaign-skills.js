require('dotenv').config();
import { performance } from 'perf_hooks';
import yargs from 'yargs';
import bluebird from 'bluebird';
import _ from 'lodash';
import logger from '../../../lib/infrastructure/logger';
import cache from '../../../lib/infrastructure/caches/learning-content-cache';
import { knex, disconnect } from '../../../db/knex-database-connection';

const DEFAULT_MAX_CAMPAIGNS_COUNT = 50000;
const DEFAULT_CONCURRENCY = 3;

const MEMO = {};

let progression = 0;
function _logProgression(totalCount) {
  ++progression;
  process.stdout.cursorTo(0);
  process.stdout.write(`${Math.round((progression * 100) / totalCount, 2)} %`);
}

const copySkills = async ({ maxCampaignCount, concurrency }) => {
  const campaignDatas = await getEligibleCampaigns(maxCampaignCount);

  logger.info(`Found ${campaignDatas.length} to handle.`);
  return bluebird.map(
    campaignDatas,
    async (campaignData) => {
      const { campaignId, targetProfileId } = campaignData;
      const skillIds = await getTargetProfileSkills(targetProfileId);
      await createCampaignSkills(campaignId, skillIds);
      _logProgression(campaignDatas.length);
    },
    { concurrency }
  );
};

async function createCampaignSkills(campaignId, skillIds) {
  const data = skillIds.map((skillId) => ({ campaignId, skillId }));
  return knex.batchInsert('campaign_skills', data);
}

async function getTargetProfileSkills(targetProfileId) {
  const key = targetProfileId.toString();
  if (!MEMO[key]) {
    const skillIds = await knex('target-profiles_skills').pluck('skillId').where({ targetProfileId });
    MEMO[key] = _.uniq(skillIds);
  }
  return MEMO[key];
}

async function getEligibleCampaigns(maxCampaignCount) {
  return knex('campaigns')
    .select({
      campaignId: 'campaigns.id',
      targetProfileId: 'campaigns.targetProfileId',
    })
    .leftJoin('campaign_skills', 'campaign_skills.campaignId', 'campaigns.id')
    .whereNull('campaign_skills.campaignId')
    .where('campaigns.type', 'ASSESSMENT')
    .whereNot('campaigns.assessmentMethod', 'FLASH')
    .orderBy('campaigns.id')
    .limit(maxCampaignCount);
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const commandLineArgs = yargs
    .option('maxCampaignCount', {
      description: 'Nombre de campagnes max. à traiter.',
      type: 'number',
      default: DEFAULT_MAX_CAMPAIGNS_COUNT,
    })
    .option('concurrency', {
      description: 'Concurrence',
      type: 'number',
      default: DEFAULT_CONCURRENCY,
    })
    .help().argv;
  const { maxCampaignCount, concurrency } = _validateAndNormalizeArgs(commandLineArgs);
  await copySkills({ maxCampaignCount, concurrency });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

function _validateAndNormalizeArgs({ concurrency, maxCampaignCount }) {
  const finalMaxCampaignCount = _validateAndNormalizeMaxCampaignCount(maxCampaignCount);
  const finalConcurrency = _validateAndNormalizeConcurrency(concurrency);

  return {
    maxCampaignCount: finalMaxCampaignCount,
    concurrency: finalConcurrency,
  };
}

function _validateAndNormalizeConcurrency(concurrency) {
  if (isNaN(concurrency)) {
    concurrency = DEFAULT_CONCURRENCY;
  }
  if (concurrency <= 0 || concurrency > 5) {
    throw new Error(`Concurrent ${concurrency} ne peut pas être inférieur à 1 ni supérieur à 5.`);
  }

  return concurrency;
}

function _validateAndNormalizeMaxCampaignCount(maxCampaignCount) {
  if (isNaN(maxCampaignCount)) {
    maxCampaignCount = DEFAULT_MAX_CAMPAIGNS_COUNT;
  }
  if (maxCampaignCount <= 0) {
    throw new Error(`Nombre max de campagnes ${maxCampaignCount} ne peut pas être inférieur à 1.`);
  }

  return maxCampaignCount;
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

export default { copySkills };
