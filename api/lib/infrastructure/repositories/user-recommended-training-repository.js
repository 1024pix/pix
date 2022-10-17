const { knex } = require('../../../db/knex-database-connection');
const DomainTransaction = require('../DomainTransaction');

const TABLE_NAME = 'user-recommended-trainings';

module.exports = {
  save({ userId, trainingId, campaignParticipationId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    return knexConn(TABLE_NAME).insert({ userId, trainingId, campaignParticipationId });
  },
};
