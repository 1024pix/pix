import { knex } from '../../../../db/knex-database-connection.js';
import { USER_RECOMMENDED_TRAININGS_TABLE_NAME } from '../../../../db/migrations/20221017085933_create-user-recommended-trainings.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserRecommendedTraining } from '../../domain/read-models/UserRecommendedTraining.js';

const save = function ({ userId, trainingId, campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .insert({ userId, trainingId, campaignParticipationId })
    .onConflict(['userId', 'trainingId', 'campaignParticipationId'])
    .merge({ updatedAt: knex.fn.now() });
};

const findByCampaignParticipationId = async function ({ campaignParticipationId, locale }) {
  const knexConn = DomainTransaction.getConnection();
  const trainings = await knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .select('trainings.*')
    .innerJoin('trainings', 'trainings.id', `${USER_RECOMMENDED_TRAININGS_TABLE_NAME}.trainingId`)
    .where({ campaignParticipationId, locale, isDisabled: false })
    .orderBy('id', 'asc');
  return trainings.map(_toDomain);
};

const findModulesByCampaignParticipationIds = async function ({ campaignParticipationIds }) {
  const knexConn = DomainTransaction.getConnection();
  const moduleLinks = await knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .select('trainings.*')
    .innerJoin('trainings', 'trainings.id', `${USER_RECOMMENDED_TRAININGS_TABLE_NAME}.trainingId`)
    .where({ isDisabled: false, type: 'modulix' })
    .whereIn('campaignParticipationId', campaignParticipationIds)
    .distinct('trainings.id')
    .orderBy('trainings.id', 'asc');

  return moduleLinks.map(_toDomain);
};

const hasRecommendedTrainings = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME).select(1).where({ userId }).first();
  return Boolean(result);
};

const deleteCampaignParticipationIds = async ({ campaignParticipationIds }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .update({ campaignParticipationId: null, updatedAt: new Date() })
    .whereIn('campaignParticipationId', campaignParticipationIds);
};

export {
  deleteCampaignParticipationIds,
  findByCampaignParticipationId,
  findModulesByCampaignParticipationIds,
  hasRecommendedTrainings,
  save,
};

function _toDomain(training) {
  return new UserRecommendedTraining({ ...training });
}
