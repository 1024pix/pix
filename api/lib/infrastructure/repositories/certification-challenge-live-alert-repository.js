import { DomainTransaction } from '../DomainTransaction.js';
import { knex } from '../../../db/knex-database-connection.js';

const save = async function ({
  certificationChallengeLiveAlert,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  return knexConn('certification-challenge-live-alerts').insert(certificationChallengeLiveAlert);
};

export { save };
