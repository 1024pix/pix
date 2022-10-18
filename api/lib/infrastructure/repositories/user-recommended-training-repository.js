const { knex } = require('../../../db/knex-database-connection');
const DomainTransaction = require('../DomainTransaction');
const UserRecommendedTraining = require('../../domain/read-models/UserRecommendedTraining');

const TABLE_NAME = 'user-recommended-trainings';

module.exports = {
  save({ userId, trainingId, campaignParticipationId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    return knexConn(TABLE_NAME).insert({ userId, trainingId, campaignParticipationId });
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
};

function _toDomain(training) {
  return new UserRecommendedTraining({ ...training });
}
