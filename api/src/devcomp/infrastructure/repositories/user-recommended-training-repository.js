import { USER_RECOMMENDED_TRAININGS_TABLE_NAME } from '../../../../db/migrations/20221017085933_create-user-recommended-trainings.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserRecommendedTraining } from '../../domain/read-models/UserRecommendedTraining.js';

const save = function ({ userId, trainingId, campaignParticipationId, isRelevant }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .insert({ userId, trainingId, campaignParticipationId, isRelevant, updatedAt: knexConn.fn.now() })
    .onConflict(['userId', 'trainingId', 'campaignParticipationId'])
    .merge(['isRelevant', 'updatedAt']);
};

const findByCampaignParticipationId = async function ({ campaignParticipationId, locale }) {
  const knexConn = DomainTransaction.getConnection();
  const trainings = await knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .select('trainings.*', 'isRelevant')
    .innerJoin('trainings', 'trainings.id', `${USER_RECOMMENDED_TRAININGS_TABLE_NAME}.trainingId`)
    .where({ campaignParticipationId, isDisabled: false })
    .whereRaw('? = ANY(locales)', locale)
    .orderBy('id', 'asc');
  return trainings.map(_toDomain);
};

const findByCampaignParticipationIdAndTrainingIdAndUserId = async function ({
  campaignParticipationId,
  trainingId,
  userId,
}) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .select('trainings.*', 'isRelevant')
    .innerJoin('trainings', 'trainings.id', `${USER_RECOMMENDED_TRAININGS_TABLE_NAME}.trainingId`)
    .where({ campaignParticipationId, trainingId, userId, isDisabled: false })
    .first();

  return result ? _toDomain(result) : null;
};

const findModulesByCampaignParticipationIds = async function ({ campaignParticipationIds }) {
  const knexConn = DomainTransaction.getConnection();
  const moduleLinks = await knexConn(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
    .select('trainings.*')
    .innerJoin('trainings', 'trainings.id', `${USER_RECOMMENDED_TRAININGS_TABLE_NAME}.trainingId`)
    .where({ isDisabled: false, type: 'modulix' })
    .whereIn('campaignParticipationId', campaignParticipationIds)
    .orderBy('trainings.id', 'asc');

  // We removed the distinct because it was extremely costly in CPU
  const seen = new Set();
  const uniqueModuleLinks = moduleLinks.filter((moduleLink) => {
    if (seen.has(moduleLink.id)) return false;
    seen.add(moduleLink.id);
    return true;
  });

  return uniqueModuleLinks.map(_toDomain);
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
  findByCampaignParticipationIdAndTrainingIdAndUserId,
  findModulesByCampaignParticipationIds,
  hasRecommendedTrainings,
  save,
};

function _toDomain(training) {
  return new UserRecommendedTraining({ ...training });
}
