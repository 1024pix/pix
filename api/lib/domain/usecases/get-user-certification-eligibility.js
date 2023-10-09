import { CertificationEligibility } from '../read-models/CertificationEligibility.js';

const getUserCertificationEligibility = async function ({
  userId,
  placementProfileService,
  certificationBadgesService,
  limitDate = new Date(),
}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate });
  const pixCertificationEligible = placementProfile.isCertifiable();

  if (!pixCertificationEligible) {
    return CertificationEligibility.notCertifiable({ userId });
  }

  const stillValidBadgeAcquisitions = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });

  const complementaryCertifications = stillValidBadgeAcquisitions.map(
    ({ complementaryCertificationBadgeLabel, complementaryCertificationBadgeImageUrl, isOutdated }) => ({
      label: complementaryCertificationBadgeLabel,
      imageUrl: complementaryCertificationBadgeImageUrl,
      isOutdated,
    }),
  );

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    complementaryCertifications,
  });
};

export { getUserCertificationEligibility };
