const dotenv = require('dotenv');
dotenv.config();
const _ = require('lodash');
const bluebird = require('bluebird');
const { performance } = require('perf_hooks');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { knex, disconnect } = require('../../db/knex-database-connection');
const CampaignParticipation = require('../../lib/domain/models/CampaignParticipation');
const logger = require('../../lib/infrastructure/logger');
const badgeAcquisitionRepository = require('../../lib/infrastructure/repositories/badge-acquisition-repository');
const badgeForCalculationRepository = require('../../lib/infrastructure/repositories/badge-for-calculation-repository');
const knowledgeElementRepository = require('../../lib/infrastructure/repositories/knowledge-element-repository');
const { cache } = require('../../lib/infrastructure/caches/learning-content-cache');

const MAX_RANGE_SIZE = 100_000;

async function main() {
  const startTime = performance.now();
  logger.info(`Script compute badge acquisitions has started`);
  const { idMin, idMax, dryRun } = _getAllArgs();
  const range = normalizeRange({ idMin, idMax });
  const numberOfCreatedBadges = await computeAllBadgeAcquisitions({ ...range, dryRun });
  logger.info(`${numberOfCreatedBadges} badges created`);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

function _getAllArgs() {
  return yargs(hideBin(process.argv))
    .option('idMin', {
      type: 'number',
      demand: true,
      description: 'id de la première campagne participation',
    })
    .option('idMax', {
      type: 'number',
      demand: true,
      description: 'id de la dernière campagne participation',
    })
    .option('dryRun', {
      type: 'boolean',
      description: 'permet de lancer le script sans créer les badges manquants',
    })
    .help().argv;
}

function normalizeRange({ idMin, idMax }) {
  const rangeSize = idMax - idMin;
  if (rangeSize > MAX_RANGE_SIZE) {
    const newIdMax = idMin + MAX_RANGE_SIZE;
    logger.info(`Max range size exceeded : new idMax is ${newIdMax}`);
    return { idMin, idMax: newIdMax };
  }
  return { idMin, idMax };
}

async function computeAllBadgeAcquisitions({ idMin, idMax, dryRun }) {
  const campaignParticipations = await getCampaignParticipationsBetweenIds({ idMin, idMax });
  const numberOfBadgeCreatedByCampaignParticipation = await bluebird.mapSeries(
    campaignParticipations,
    async (campaignParticipation, index) => {
      logger.info(`${index}/${campaignParticipations.length}`);
      return computeBadgeAcquisition({
        campaignParticipation,
        dryRun,
        badgeForCalculationRepository,
        badgeAcquisitionRepository,
        knowledgeElementRepository,
      });
    }
  );
  return _.sum(numberOfBadgeCreatedByCampaignParticipation);
}

async function computeBadgeAcquisition({
  campaignParticipation,
  dryRun = false,
  badgeForCalculationRepository,
  badgeAcquisitionRepository,
  knowledgeElementRepository,
} = {}) {
  const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(
    campaignParticipation,
    badgeForCalculationRepository
  );
  if (_.isEmpty(associatedBadges)) {
    return 0;
  }

  const userId = campaignParticipation.userId;
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });

  const obtainedBadgesByUser = associatedBadges.filter((badge) => badge.shouldBeObtained(knowledgeElements));

  const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({
    badgeIds: obtainedBadgesByUser.map(({ id }) => id),
    userId,
  });

  const badgeAcquisitionsToCreate = obtainedBadgesByUser
    .filter((badge) => !acquiredBadgeIds.includes(badge.id))
    .map((badge) => {
      return {
        badgeId: badge.id,
        userId,
        campaignParticipationId: campaignParticipation.id,
      };
    });

  if (_.isEmpty(badgeAcquisitionsToCreate)) {
    return 0;
  }

  if (!dryRun) {
    await badgeAcquisitionRepository.createOrUpdate({ badgeAcquisitionsToCreate });
  }

  return badgeAcquisitionsToCreate.length;
}

function _fetchPossibleCampaignAssociatedBadges(campaignParticipation, badgeForCalculationRepository) {
  return badgeForCalculationRepository.findByCampaignParticipationId({
    campaignParticipationId: campaignParticipation.id,
  });
}

async function getCampaignParticipationsBetweenIds({ idMin, idMax }) {
  const campaignParticipations = await knex('campaign-participations')
    .whereBetween('id', [idMin, idMax])
    .orderBy('id', 'asc');
  return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
}

const isLaunchedFromCommandLine = require.main === module;

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

module.exports = {
  normalizeRange,
  computeAllBadgeAcquisitions,
  computeBadgeAcquisition,
  getCampaignParticipationsBetweenIds,
};
