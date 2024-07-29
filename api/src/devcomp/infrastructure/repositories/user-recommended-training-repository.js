import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserRecommendedTraining } from '../../domain/read-models/UserRecommendedTraining.js';

const TABLE_NAME = 'user-recommended-trainings';

const save = function ({ userId, trainingId, campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(TABLE_NAME)
    .insert({ userId, trainingId, campaignParticipationId })
    .onConflict(['userId', 'trainingId', 'campaignParticipationId'])
    .merge({ updatedAt: knexConn.fn.now() });
};

const findByCampaignParticipationId = async function ({ campaignParticipationId, locale }) {
  const knexConn = DomainTransaction.getConnection();
  const trainings = await knexConn(TABLE_NAME)
    .select('trainings.*')
    .innerJoin('trainings', 'trainings.id', `${TABLE_NAME}.trainingId`)
    .where({ campaignParticipationId, locale, isDisabled: false })
    .orderBy('id', 'asc');
  return trainings.map(_toDomain);
};

const hasRecommendedTrainings = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn(TABLE_NAME).select(1).where({ userId }).first();
  return Boolean(result);
};

export { findByCampaignParticipationId, hasRecommendedTrainings, save };

function _toDomain(training) {
  return new UserRecommendedTraining({ ...training });
}
