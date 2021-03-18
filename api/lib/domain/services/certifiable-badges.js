const _ = require('lodash');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');

async function hasCertifiableBadges(userId) {
  const certifiableBadgesAcquisitions = await badgeAcquisitionRepository.getCertifiableAcquiredBadges({ userId });
  return certifiableBadgesAcquisitions.length > 0;
}

async function getTargetProfileIdFromAcquiredCertifiableBadges(userId) {
  const certifiableBadgesAcquisitions = await badgeAcquisitionRepository.getCertifiableAcquiredBadges({ userId });
  return _.uniq(certifiableBadgesAcquisitions.map((certifiableBadgesAcquisition) => {
    return certifiableBadgesAcquisition.badge.targetProfileId;
  }));
}

module.exports = {
  hasCertifiableBadges,
  getTargetProfileIdFromAcquiredCertifiableBadges,
};
