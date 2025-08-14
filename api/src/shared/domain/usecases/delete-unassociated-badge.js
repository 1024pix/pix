import * as injectedComplementaryCertificationBadgeRepository from '../../../certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as injectedBadgeRepository from '../../../evaluation/infrastructure/repositories/badge-repository.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AcquiredBadgeForbiddenDeletionError, CertificationBadgeForbiddenDeletionError } from '../../domain/errors.js';

const deleteUnassociatedBadge = async function ({
  badgeId,
  badgeRepository = injectedBadgeRepository,
  complementaryCertificationBadgeRepository = injectedComplementaryCertificationBadgeRepository,
} = {}) {
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
