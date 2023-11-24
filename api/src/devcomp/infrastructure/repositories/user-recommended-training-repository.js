import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { UserRecommendedTraining } from '../../domain/read-models/UserRecommendedTraining.js';

const TABLE_NAME = 'user-recommended-trainings';

const save = function ({
  userId,
  trainingId,
  campaignParticipationId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  return knexConn(TABLE_NAME)
    .insert({ userId, trainingId, campaignParticipationId })
    .onConflict(['userId', 'trainingId', 'campaignParticipationId'])
    .merge({ updatedAt: knexConn.fn.now() });
};

const findByCampaignParticipationId = async function ({
  campaignParticipationId,
  locale,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const trainings = await knexConn(TABLE_NAME)
    .select('trainings.*')
    .innerJoin('trainings', 'trainings.id', `${TABLE_NAME}.trainingId`)
    .where({ campaignParticipationId, locale })
    .orderBy('id', 'asc');
  return trainings.map(_toDomain);
};

const hasRecommendedTrainings = async function ({ userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const result = await knexConn(TABLE_NAME).select(1).where({ userId }).first();
  return Boolean(result);
};

export { save, findByCampaignParticipationId, hasRecommendedTrainings };

function _toDomain(training) {
  return new UserRecommendedTraining({ ...training });
}
