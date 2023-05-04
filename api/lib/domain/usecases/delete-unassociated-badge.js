import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

import { AcquiredBadgeForbiddenDeletionError, CertificationBadgeForbiddenDeletionError } from '../errors.js';

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

    return badgeRepository.delete(badgeId, domainTransaction);
  });
};

export { deleteUnassociatedBadge };
