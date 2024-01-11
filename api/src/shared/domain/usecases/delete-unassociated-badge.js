import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import {
  AcquiredBadgeForbiddenDeletionError,
  CertificationBadgeForbiddenDeletionError,
} from '../../../../lib/domain/errors.js';

const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return DomainTransaction.execute(async (domainTransaction) => {
    const isAssociated = await badgeRepository.isAssociated(badgeId, domainTransaction);
    const isRelatedToCertification = await badgeRepository.isRelatedToCertification(badgeId, domainTransaction);

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
