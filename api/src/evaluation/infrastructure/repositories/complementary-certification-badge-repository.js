import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export async function isAttachedToComplementaryCertification(badgeId) {
  const knexConn = DomainTransaction.getConnection();
  const complementaryCertificationBadge = await knexConn('complementary-certification-badges')
    .where({ badgeId })
    .first();
  return !!complementaryCertificationBadge;
}
