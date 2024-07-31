import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

async function findIds() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('users').where({ hasBeenAnonymised: true }).pluck('id');
}

export const anonymizedUserRepository = { findIds };
