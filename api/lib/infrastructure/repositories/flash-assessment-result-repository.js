const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');

const TABLE_NAME = 'flash-assessment-results';

module.exports = {
  async save({
    answerId,
    estimatedLevel,
    errorRate,
    assessmentId,
    domainTransaction: { knexTransaction } = DomainTransaction.emptyTransaction(),
  }) {
    const query = knex(TABLE_NAME).insert({
      answerId,
      estimatedLevel,
      errorRate,
      assessmentId,
    });
    if (knexTransaction) query.transacting(knexTransaction);
    return query;
  },

  async getLatestByAssessmentId(assessmentId) {
    return knex(TABLE_NAME).where({ assessmentId }).orderBy('id', 'desc').limit(1).first();
  },
};
