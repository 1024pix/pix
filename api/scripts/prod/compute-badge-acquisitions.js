require('dotenv').config();
const _ = require('lodash');
const { performance } = require('perf_hooks');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { knex, disconnect } = require('../../db/knex-database-connection');
const CampaignParticipation = require('../../lib/domain/models/CampaignParticipation');
const logger = require('../../lib/infrastructure/logger');

async function main() {
  const startTime = performance.now();
  logger.info(`Script compute badge acquisitions has started`);
  const args = _getAllArgs();

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

async function computeBadgeAcquisition({
  campaignParticipation,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  knowledgeElementRepository,
  targetProfileRepository,
}) {
  const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(campaignParticipation, badgeRepository);
  if (_.isEmpty(associatedBadges)) {
    return;
  }
  const targetProfile = await targetProfileRepository.getByCampaignParticipationId(campaignParticipation.id);
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId });

  const validatedBadgesByUser = associatedBadges.filter((badge) =>
    badgeCriteriaService.areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge })
  );

  const badgesAcquisitionToCreate = validatedBadgesByUser.map((badge) => {
    return {
      badgeId: badge.id,
      userId: campaignParticipation.userId,
      campaignParticipationId: campaignParticipation.id,
    };
  });

  if (!_.isEmpty(badgesAcquisitionToCreate)) {
    await badgeAcquisitionRepository.createOrUpdate(badgesAcquisitionToCreate);
  }
}

function _fetchPossibleCampaignAssociatedBadges(campaignParticipation, badgeRepository) {
  return badgeRepository.findByCampaignParticipationId(campaignParticipation.id);
}

async function getCampaignParticipationsBetweenIds({ idMin, idMax }) {
  const campaignParticipations = await knex('campaign-participations').whereBetween('id', [idMin, idMax]);
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
    }
  }
})();

module.exports = { computeBadgeAcquisition, getCampaignParticipationsBetweenIds };
