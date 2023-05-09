import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

const TABLE_NAME = 'flash-assessment-results';

const save = async function ({
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
};

const getLatestByAssessmentId = async function (assessmentId) {
  return knex(TABLE_NAME).where({ assessmentId }).orderBy('id', 'desc').limit(1).first();
};

export { save, getLatestByAssessmentId };
