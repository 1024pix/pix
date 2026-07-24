import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function authorizeToStart(candidateId) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-candidates')
    .where({
      id: candidateId,
    })
    .update({ authorizedToStart: true, authorizedToStartAt: new Date() });
}

export async function unauthorizeToStart(candidateId) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-candidates')
    .where({
      id: candidateId,
    })
    .update({ authorizedToStart: false, authorizedToStartAt: null });
}
