import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

function insert(jobs, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConn = domainTransaction.knexTransaction || knex;
  return knexConn('pgboss.job').insert(jobs);
}

export { insert };
