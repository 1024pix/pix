const { knex } = require('../../../db/knex-database-connection');
const DomainTransaction = require('../DomainTransaction');

const TABLE_NAME = 'flash-assessment-results';

module.exports = {
  async updateEstimatedLevelAndErrorRate({
    assessmentId,
    estimatedLevel,
    errorRate,
    domainTransaction: { knexTransaction } = DomainTransaction.emptyTransaction(),
  }) {
    const query = knex(TABLE_NAME)
      .insert({
        assessmentId,
        estimatedLevel,
        errorRate,
      })
      .onConflict('assessmentId')
      .merge();
    if (knexTransaction) query.transacting(knexTransaction);
    return query;
  },
};
