import { Training } from '../../../../lib/domain/models/Training.js';
import { TrainingSummary } from '../../domain/read-models/TrainingSummary.js';
import { knex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { UserRecommendedTraining } from '../../../../lib/domain/read-models/UserRecommendedTraining.js';
import { fetchPage } from '../../../../lib/infrastructure/utils/knex-utils.js';
import lodash from 'lodash';
import * as trainingTriggerRepository from './training-trigger-repository.js';
import { TrainingForAdmin } from '../../../../lib/domain/read-models/TrainingForAdmin.js';
import { TrainingTrigger } from '../../../../lib/domain/models/index.js';

const { pick } = lodash;

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

  const trainingTriggers = await trainingTriggerRepository.findByTrainingIdForAdmin({ trainingId, domainTransaction });

  return _toDomainForAdmin({ training: trainingDTO, targetProfileTrainings, trainingTriggers });
}

async function findPaginatedSummaries({ filter, page, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const query = knexConn(TABLE_NAME)
    .select(
      'trainings.id',
      'trainings.title',
      knexConn.raw('coalesce("targetProfilesCount", 0) as "targetProfilesCount"'),
    )
    .leftJoin(
      knexConn('target-profile-trainings')
        .select('trainingId', knexConn.raw('count(\'trainingId\') as "targetProfilesCount"'))
        .groupBy('trainingId')
        .as('target-profile-trainings-count'),
      'target-profile-trainings-count.trainingId',
      `${TABLE_NAME}.id`,
    )
    .orderBy('trainings.id', 'asc')
    .modify(_applyFilters, filter);
  const { results, pagination } = await fetchPage(query, page);

  const trainingTriggers = await knexConn('training-triggers').whereIn(
    'trainingId',
    results.map(({ id }) => id),
  );

  const trainingSummaries = results.map((trainingSummary) => _toDomainSummary({ trainingSummary, trainingTriggers }));
  return { trainings: trainingSummaries, pagination };
}

async function findPaginatedSummariesByTargetProfileId({
  targetProfileId,
  page,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const query = knexConn(TABLE_NAME)
    .select(
      'trainings.id',
      'trainings.title',
      knexConn.raw('coalesce("targetProfilesCount", 0) as "targetProfilesCount"'),
    )
    .innerJoin('target-profile-trainings', `${TABLE_NAME}.id`, 'target-profile-trainings.trainingId')
    .leftJoin(
      knexConn('target-profile-trainings')
        .select('trainingId', knexConn.raw('count(\'trainingId\') as "targetProfilesCount"'))
        .groupBy('trainingId')
        .as('target-profile-trainings-count'),
      'target-profile-trainings-count.trainingId',
      `${TABLE_NAME}.id`,
    )
    .where({ 'target-profile-trainings.targetProfileId': targetProfileId })
    .orderBy('id', 'asc');

  const { results, pagination } = await fetchPage(query, page);

  const trainingTriggers = await knexConn('training-triggers').whereIn(
    'trainingId',
    results.map(({ id }) => id),
  );

  const trainings = results.map((training) => _toDomainSummary({ trainingSummary: training, trainingTriggers }));
  return { trainings, pagination };
}

async function findWithTriggersByCampaignParticipationIdAndLocale({
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
    trainingsDTO.map(({ id }) => id),
  );

  return Promise.all(
    trainingsDTO.map(async (training) => {
      const trainingTriggers = await trainingTriggerRepository.findByTrainingId({
        trainingId: training.id,
        domainTransaction,
      });
      training.trainingTriggers = trainingTriggers;
      return _toDomain(training, targetProfileTrainings);
    }),
  );
}

async function create({ training, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const pickedAttributes = pick(training, [
    'title',
    'link',
    'type',
    'duration',
    'locale',
    'editorName',
    'editorLogoUrl',
  ]);
  const [createdTraining] = await knexConn(TABLE_NAME).insert(pickedAttributes).returning('*');
  return new TrainingForAdmin(createdTraining);
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

  return _toDomainForAdmin({ training: updatedTraining, targetProfileTrainings });
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
    (userRecommendedTraining) => new UserRecommendedTraining(userRecommendedTraining),
  );
  return { userRecommendedTrainings, pagination };
}

export {
  get,
  getWithTriggersForAdmin,
  findPaginatedSummaries,
  findPaginatedSummariesByTargetProfileId,
  findWithTriggersByCampaignParticipationIdAndLocale,
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

function _toDomainSummary({ trainingSummary, trainingTriggers }) {
  const goalThreshold = trainingTriggers.find(
    ({ trainingId, type }) => trainingId === trainingSummary.id && type === TrainingTrigger.types.GOAL,
  )?.threshold;
  const prerequisiteThreshold = trainingTriggers.find(
    ({ trainingId, type }) => trainingId === trainingSummary.id && type === TrainingTrigger.types.PREREQUISITE,
  )?.threshold;

  return new TrainingSummary({ ...trainingSummary, goalThreshold, prerequisiteThreshold });
}

function _applyFilters(qb, filter) {
  const { title, id } = filter;
  if (title) {
    qb.whereILike('title', `%${title}%`);
  }
  if (id) {
    qb.where({ id });
  }
  return qb;
}
