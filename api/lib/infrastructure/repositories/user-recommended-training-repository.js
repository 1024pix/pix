const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');
const UserRecommendedTraining = require('../../domain/read-models/UserRecommendedTraining.js');

const TABLE_NAME = 'user-recommended-trainings';

module.exports = {
  save({ userId, trainingId, campaignParticipationId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    return knexConn(TABLE_NAME)
      .insert({ userId, trainingId, campaignParticipationId })
      .onConflict(['userId', 'trainingId', 'campaignParticipationId'])
      .merge({ updatedAt: knexConn.fn.now() });
  },

  async findByCampaignParticipationId({
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
  },

  async hasRecommendedTrainings(userId, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const result = await knexConn(TABLE_NAME).select(1).where({ userId }).first();
    return Boolean(result);
  },
};

function _toDomain(training) {
  return new UserRecommendedTraining({ ...training });
}
