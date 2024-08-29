import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

async function findLegacyAnonymizedIds() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('users').where({ hasBeenAnonymised: true }).whereNot({ lastName: '(anonymised)' }).pluck('id');
}

export const anonymizedUserRepository = { findLegacyAnonymizedIds };
