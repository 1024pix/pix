const _ = require('lodash');
const CertificationEligibility = require('../read-models/CertificationEligibility');

module.exports = async function getUserCertificationEligibility({
  userId,
  placementProfileService,
  badgeAcquisitionRepository,
  badgeRepository,
  targetProfileRepository,
  knowledgeElementRepository,
  badgeCriteriaService,
  certificationBadgesService,
}) {
  const now = new Date();
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: now });
  const pixCertificationEligible = placementProfile.isCertifiable();
  const cleaCertificationEligible = await _computeCleaCertificationEligibility({
    userId,
    date: now,
    pixCertificationEligible,
    badgeAcquisitionRepository,
    badgeRepository,
    targetProfileRepository,
    knowledgeElementRepository,
    badgeCriteriaService,
  });
  const {
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
  } = await _computePixPlusDroitCertificationEligibility({
    userId,
    pixCertificationEligible,
    certificationBadgesService,
  });

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    cleaCertificationEligible,
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
  });
};

async function _computeCleaCertificationEligibility({
  userId,
  date,
  pixCertificationEligible,
  badgeAcquisitionRepository,
  badgeRepository,
  targetProfileRepository,
  knowledgeElementRepository,
  badgeCriteriaService,
}) {
  if (!pixCertificationEligible) return false;
  const hasAcquiredCleaBadge = await badgeAcquisitionRepository.hasAcquiredBadge({
    badgeKey: CertificationEligibility.cleaBadgeKey,
    userId,
  });
  if (!hasAcquiredCleaBadge) return false;

  const badge = await badgeRepository.getByKey(CertificationEligibility.cleaBadgeKey);
  const targetProfile = await targetProfileRepository.get(badge.targetProfileId);
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId,
    limitDate: date,
  });

  return badgeCriteriaService.areBadgeCriteriaFulfilled({
    knowledgeElements,
    targetProfile,
    badge,
  });
}

async function _computePixPlusDroitCertificationEligibility({
  userId,
  pixCertificationEligible,
  certificationBadgesService,
}) {
  if (!pixCertificationEligible) {
    return {
      pixPlusDroitMaitreCertificationEligible: false,
      pixPlusDroitExpertCertificationEligible: false,
    };
  }
  const stillValidCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({ userId });
  const pixPlusDroitMaitreBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, { badgeKey: CertificationEligibility.pixPlusDroitMaitreBadgeKey });
  const pixPlusDroitExpertBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, { badgeKey: CertificationEligibility.pixPlusDroitExpertBadgeKey });
  const pixPlusDroitMaitreCertificationEligible = Boolean(pixPlusDroitMaitreBadgeAcquisition);
  const pixPlusDroitExpertCertificationEligible = Boolean(pixPlusDroitExpertBadgeAcquisition);
  return {
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
  };
}
