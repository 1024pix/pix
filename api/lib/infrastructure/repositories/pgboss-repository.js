import { DomainTransaction } from '../DomainTransaction.js';

function insert(jobs) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('pgboss.job').insert(jobs);
}

export { insert };
