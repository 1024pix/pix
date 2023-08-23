import { DomainTransaction } from '../DomainTransaction.js';
import { knex } from '../../../db/knex-database-connection.js';

const save = async function ({
  certificationChallengeLiveAlert,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  return knexConn('certification-challenge-live-alerts').insert(certificationChallengeLiveAlert);
};

const getByAssessmentId = async (assessmentId) => {
  return knex('certification-challenge-live-alerts').where({
    assessmentId,
  });
};

export { save, getByAssessmentId };
