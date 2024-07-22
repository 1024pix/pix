import lodash from 'lodash';

import { NotFoundError } from '../../../../lib/domain/errors.js';
import { TrainingTrigger } from '../../../../lib/domain/models/index.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import { Training } from '../../domain/models/Training.js';
import { TrainingForAdmin } from '../../domain/read-models/TrainingForAdmin.js';
import { TrainingSummary } from '../../domain/read-models/TrainingSummary.js';
import { UserRecommendedTraining } from '../../domain/read-models/UserRecommendedTraining.js';
import * as trainingTriggerRepository from './training-trigger-repository.js';

const { pick } = lodash;

const TABLE_NAME = 'trainings';

async function get({ trainingId }) {
  const knexConn = DomainTransaction.getConnection();
  const training = await knexConn(TABLE_NAME).where({ id: trainingId }).first();
  if (!training) {
    throw new NotFoundError(`Not found training for ID ${trainingId}`);
  }

  const targetProfileTrainings = await knexConn('target-profile-trainings').where('trainingId', training.id);

  return _toDomain(training, targetProfileTrainings);
}

async function getWithTriggersForAdmin({ trainingId }) {
  const knexConn = DomainTransaction.getConnection();
  const trainingDTO = await knexConn(TABLE_NAME).where({ id: trainingId }).first();
  if (!trainingDTO) {
    throw new NotFoundError(`Not found training for ID ${trainingId}`);
  }

  const targetProfileTrainings = await knexConn('target-profile-trainings').where('trainingId', trainingDTO.id);

  const trainingTriggers = await trainingTriggerRepository.findByTrainingIdForAdmin({ trainingId });

  return _toDomainForAdmin({ training: trainingDTO, targetProfileTrainings, trainingTriggers });
}

async function findPaginatedSummaries({ filter, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn(TABLE_NAME)
    .select(
      'trainings.id',
      'trainings.title',
      'trainings.isDisabled',
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

async function findPaginatedSummariesByTargetProfileId({ targetProfileId, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn(TABLE_NAME)
    .select(
      'trainings.id',
      'trainings.title',
      knexConn.raw('coalesce("targetProfilesCount", 0) as "targetProfilesCount"'),
      'trainings.isDisabled',
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

async function findWithTriggersByCampaignParticipationIdAndLocale({ campaignParticipationId, locale }) {
  const knexConn = DomainTransaction.getConnection();
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
      });
      training.trainingTriggers = trainingTriggers;
      return _toDomain(training, targetProfileTrainings);
    }),
  );
}

async function create({ training }) {
  const knexConn = DomainTransaction.getConnection();
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

async function update({ id, attributesToUpdate }) {
  const pickedAttributesToUpdate = pick(attributesToUpdate, [
    'title',
    'link',
    'type',
    'duration',
    'locale',
    'editorName',
    'editorLogoUrl',
    'isDisabled',
  ]);
  const knexConn = DomainTransaction.getConnection();
  const [updatedTraining] = await knexConn(TABLE_NAME)
    .where({ id })
    .update({ ...pickedAttributesToUpdate, updatedAt: new Date() })
    .returning('*');

  const targetProfileTrainings = await knexConn('target-profile-trainings').where({ trainingId: id });

  return _toDomainForAdmin({ training: updatedTraining, targetProfileTrainings });
}

async function findPaginatedByUserId({ userId, locale, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn(TABLE_NAME)
    .select('trainings.*')
    .distinct('trainings.id')
    .join('user-recommended-trainings', 'trainings.id', 'trainingId')
    .where({ userId, locale, isDisabled: false })
    .orderBy('id', 'asc');
  const { results, pagination } = await fetchPage(query, page);

  const userRecommendedTrainings = results.map(
    (userRecommendedTraining) => new UserRecommendedTraining(userRecommendedTraining),
  );
  return { userRecommendedTrainings, pagination };
}

export {
  create,
  findPaginatedByUserId,
  findPaginatedSummaries,
  findPaginatedSummariesByTargetProfileId,
  findWithTriggersByCampaignParticipationIdAndLocale,
  get,
  getWithTriggersForAdmin,
  update,
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
