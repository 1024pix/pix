require('dotenv').config();
const logger = require('../lib/infrastructure/logger');
const cache = require('../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../db/knex-database-connection');
const { parseCsvWithHeaderAndRequiredFields } = require('./helpers/csvHelpers');
const trainingRepository = require('../lib/infrastructure/repositories/training-repository');
const _ = require('lodash');

const REQUIRED_FIELD_NAMES = ['userId', 'campaignParticipationId', 'targetProfileId'];
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

async function main() {
  logger.info('Starting creating user-recommended-trainings.');

  const filePath = process.argv[2];

  logger.info('Reading and parsing csv data file... ');
  const csvData = await parseCsvWithHeaderAndRequiredFields({ filePath, requiredFieldNames: REQUIRED_FIELD_NAMES });

  const campaignParticipationsToCompute = sanitizeCampaignParticipations(csvData);

  logger.info('Compute user-recommended-trainings');
  const userRecommendedTrainingsToInsert = await getUserRecommendedTrainings({
    campaignParticipations: campaignParticipationsToCompute,
    trainingRepository,
  });

  logger.info(`Insert ${userRecommendedTrainingsToInsert.length} user-recommended-trainings`);
  await insertUserRecommendedTrainings(userRecommendedTrainingsToInsert);
}

function sanitizeCampaignParticipations(raw) {
  return raw.map(({ userId, campaignParticipationId, targetProfileId }) => {
    return {
      userId: Number(userId),
      campaignParticipationId: Number(campaignParticipationId),
      targetProfileId: Number(targetProfileId),
    };
  });
}

async function getUserRecommendedTrainings({ campaignParticipations, trainingRepository }) {
  const campaignParticipationsGroupedByTargetProfileId = _.groupBy(campaignParticipations, 'targetProfileId');

  const targetProfileIds = Object.keys(campaignParticipationsGroupedByTargetProfileId);

  const userRecommendTrainingsGroupByTargetProfile = await Promise.all(
    targetProfileIds.map(async (targetProfileId) => {
      const trainings = await _getTrainings(trainingRepository, targetProfileId);
      const campaignParticipations = campaignParticipationsGroupedByTargetProfileId[targetProfileId];
      return _getUserRecommendedTraining(campaignParticipations, trainings);
    })
  );

  return userRecommendTrainingsGroupByTargetProfile.flat();
}

async function _getTrainings(trainingRepository, targetProfileId) {
  return trainingRepository.findByTargetProfileIdAndLocale({
    targetProfileId: Number(targetProfileId),
  });
}

function _getUserRecommendedTraining(campaignParticipations, trainings) {
  return campaignParticipations.flatMap(({ userId, campaignParticipationId }) => {
    return trainings.map(({ id: trainingId }) => ({ userId, campaignParticipationId, trainingId }));
  });
}

async function insertUserRecommendedTrainings(userRecommendedTrainings) {
  for (const userRecommendedTraining of userRecommendedTrainings) {
    await knex('user-recommended-trainings').insert(userRecommendedTraining).onConflict().ignore();
  }
}

module.exports = { getUserRecommendedTrainings, sanitizeCampaignParticipations, insertUserRecommendedTrainings };
