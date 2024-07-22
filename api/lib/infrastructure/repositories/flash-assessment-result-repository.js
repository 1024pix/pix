import { DomainTransaction } from '../DomainTransaction.js';

const TABLE_NAME = 'flash-assessment-results';

const save = async function ({ answerId, estimatedLevel, errorRate, assessmentId }) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn(TABLE_NAME).insert({
    answerId,
    estimatedLevel,
    errorRate,
    assessmentId,
  });
};

const getLatestByAssessmentId = async function (assessmentId) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(TABLE_NAME).where({ assessmentId }).orderBy('id', 'desc').limit(1).first();
};

export { getLatestByAssessmentId, save };
