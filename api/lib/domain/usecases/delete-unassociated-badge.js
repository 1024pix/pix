const DomainTransaction = require('../../infrastructure/DomainTransaction.js');
const { AcquiredBadgeForbiddenDeletionError, CertificationBadgeForbiddenDeletionError } = require('../errors.js');

module.exports = async function deleteUnassociatedBadge({ badgeId, badgeRepository }) {
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
