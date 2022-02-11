const { AcquiredBadgeForbiddenDeletionError, CertificationBadgeForbiddenDeletionError } = require('../errors');

module.exports = async function deleteUnassociatedBadge({ badgeId, badgeRepository }) {
  const isAssociated = await badgeRepository.isAssociated(badgeId);
  const isRelatedToCertification = await badgeRepository.isRelatedToCertification(badgeId);

  if (isAssociated) {
    throw new AcquiredBadgeForbiddenDeletionError();
  }

  if (isRelatedToCertification) {
    throw new CertificationBadgeForbiddenDeletionError();
  }

  return badgeRepository.delete(badgeId);
};
