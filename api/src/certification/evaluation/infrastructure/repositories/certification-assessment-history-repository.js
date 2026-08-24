import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export function save(certificationChallengeHistory) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-challenge-capacities')
    .insert(certificationChallengeHistory.capacityHistory)
    .onConflict('certificationChallengeId')
    .merge();
}
