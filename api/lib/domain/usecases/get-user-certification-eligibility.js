const CertificationEligibility = require('../read-models/CertificationEligibility');

module.exports = async function getUserCertificationEligibility({
  userId,
  placementProfileService,
  badgeAcquisitionRepository,
  badgeRepository,
  targetProfileRepository,
  knowledgeElementRepository,
  badgeCriteriaService,
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

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    cleaCertificationEligible,
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
