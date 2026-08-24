import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function authorizeToStart(candidateId) {
  const knexConn = DomainTransaction.getConnection();
  const [result] = await knexConn('certification-candidates')
    .where({
      id: candidateId,
    })
    .update({ authorizedToStartAt: new Date() })
    .returning('authorizedToStartAt');

  return result.authorizedToStartAt;
}

export async function unauthorizeToStart(candidateId) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-candidates')
    .where({
      id: candidateId,
    })
    .update({ authorizedToStartAt: null });
}
