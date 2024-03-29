import {
  AcquiredBadgeForbiddenDeletionError,
  CertificationBadgeForbiddenDeletionError,
} from '../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const deleteUnassociatedBadge = async function ({
  badgeId,
  badgeRepository,
  complementaryCertificationBadgeRepository,
}) {
  return DomainTransaction.execute(async (domainTransaction) => {
    const isAssociated = await badgeRepository.isAssociated(badgeId, domainTransaction);
    const isRelatedToCertification = await complementaryCertificationBadgeRepository.isRelatedToCertification(
      badgeId,
      domainTransaction,
    );

    if (isAssociated) {
      throw new AcquiredBadgeForbiddenDeletionError();
    }

    if (isRelatedToCertification) {
      throw new CertificationBadgeForbiddenDeletionError();
    }

    return badgeRepository.remove(badgeId, domainTransaction);
  });
};
export { deleteUnassociatedBadge };
