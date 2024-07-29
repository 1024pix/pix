import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AcquiredBadgeForbiddenDeletionError, CertificationBadgeForbiddenDeletionError } from '../../domain/errors.js';

const deleteUnassociatedBadge = async function ({
  badgeId,
  badgeRepository,
  complementaryCertificationBadgeRepository,
}) {
  return DomainTransaction.execute(async () => {
    const isAssociated = await badgeRepository.isAssociated(badgeId);
    const isRelatedToCertification = await complementaryCertificationBadgeRepository.isRelatedToCertification(badgeId);

    if (isAssociated) {
      throw new AcquiredBadgeForbiddenDeletionError();
    }

    if (isRelatedToCertification) {
      throw new CertificationBadgeForbiddenDeletionError();
    }

    return badgeRepository.remove(badgeId);
  });
};
export { deleteUnassociatedBadge };
