import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function isCertificationLinkedToUser({ certificationId, userId }) {
  const knexConn = DomainTransaction.getConnection();
  const exists = await knexConn
    .select('id')
    .from('certification-courses')
    .where({ id: certificationId, userId })
    .first();

  return !!exists;
}
