const Training = require('../../domain/models/Training.js');
const TrainingSummary = require('../../domain/read-models/TrainingSummary.js');
const { knex } = require('../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../domain/errors.js');
const DomainTransaction = require('../DomainTransaction.js');
const UserRecommendedTraining = require('../../domain/read-models/UserRecommendedTraining.js');
const { fetchPage } = require('../utils/knex-utils.js');
const pick = require('lodash/pick');
const trainingTriggerRepository = require('./training-trigger-repository.js');
const TrainingForAdmin = require('../../domain/read-models/TrainingForAdmin');
const TABLE_NAME = 'trainings';

async function get({ trainingId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const training = await knexConn(TABLE_NAME).where({ id: trainingId }).first();
  if (!training) {
    throw new NotFoundError(`Not found training for ID ${trainingId}`);
  }

  const targetProfileTrainings = await knexConn('target-profile-trainings').where('trainingId', training.id);

  return _toDomain(training, targetProfileTrainings);
}

async function getWithTriggersForAdmin({ trainingId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const trainingDTO = await knexConn(TABLE_NAME).where({ id: trainingId }).first();
  if (!trainingDTO) {
    throw new NotFoundError(`Not found training for ID ${trainingId}`);
  }

  const targetProfileTrainings = await knexConn('target-profile-trainings').where('trainingId', trainingDTO.id);

  const trainingTriggers = await trainingTriggerRepository.findByTrainingId({ trainingId, domainTransaction });

  return _toDomainForAdmin({ training: trainingDTO, targetProfileTrainings, trainingTriggers });
}

async function findPaginatedSummaries({ page, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const query = knexConn(TABLE_NAME).select('trainings.*').orderBy('id', 'asc');
  const { results, pagination } = await fetchPage(query, page);

  const trainings = results.map((training) => new TrainingSummary(training));
  return { trainings, pagination };
}

async function findByCampaignParticipationIdAndLocale({
  campaignParticipationId,
  locale,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const trainingsDTO = await knexConn(TABLE_NAME)
    .select('trainings.*')
    .join('target-profile-trainings', `${TABLE_NAME}.id`, 'trainingId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profile-trainings.targetProfileId')
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .where({ locale })
    .orderBy('trainings.id', 'asc');

  const targetProfileTrainings = await knexConn('target-profile-trainings').whereIn(
    'trainingId',
    trainingsDTO.map(({ id }) => id)
  );

  return trainingsDTO.map((training) => _toDomain(training, targetProfileTrainings));
}

async function create({ training, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const [createdTraining] = await knexConn(TABLE_NAME).insert(training).returning('*');
  return new Training(createdTraining);
}

async function update({ id, attributesToUpdate, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const pickedAttributesToUpdate = pick(attributesToUpdate, [
    'title',
    'link',
    'type',
    'duration',
    'locale',
    'editorName',
    'editorLogoUrl',
  ]);
  const knexConn = domainTransaction?.knexTransaction || knex;
  const [updatedTraining] = await knexConn(TABLE_NAME)
    .where({ id })
    .update({ ...pickedAttributesToUpdate, updatedAt: new Date() })
    .returning('*');

  const targetProfileTrainings = await knexConn('target-profile-trainings').where({ trainingId: id });

  return _toDomain(updatedTraining, targetProfileTrainings);
}

async function findPaginatedByUserId({
  userId,
  locale,
  page,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const query = knexConn(TABLE_NAME)
    .select('trainings.*')
    .distinct('trainings.id')
    .join('user-recommended-trainings', 'trainings.id', 'trainingId')
    .where({ userId, locale })
    .orderBy('id', 'asc');
  const { results, pagination } = await fetchPage(query, page);

  const userRecommendedTrainings = results.map(
    (userRecommendedTraining) => new UserRecommendedTraining(userRecommendedTraining)
  );
  return { userRecommendedTrainings, pagination };
}

module.exports = {
  get,
  getWithTriggersForAdmin,
  findPaginatedSummaries,
  findByCampaignParticipationIdAndLocale,
  create,
  update,
  findPaginatedByUserId,
};

function _toDomain(training, targetProfileTrainings) {
  const targetProfileIds = targetProfileTrainings
    .filter(({ trainingId }) => trainingId === training.id)
    .map(({ targetProfileId }) => targetProfileId);

  return new Training({ ...training, targetProfileIds });
}

function _toDomainForAdmin({ training, trainingTriggers, targetProfileTrainings }) {
  const targetProfileIds = targetProfileTrainings
    .filter(({ trainingId }) => trainingId === training.id)
    .map(({ targetProfileId }) => targetProfileId);

  return new TrainingForAdmin({ ...training, targetProfileIds, trainingTriggers });
}
