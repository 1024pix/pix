import { CertificationEligibility } from '../read-models/CertificationEligibility.js';

const getUserCertificationEligibility = async function ({
  userId,
  placementProfileService,
  certificationBadgesService,
  limitDate = new Date(),
  complementaryCertificationCourseRepository,
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

  const complementaryCertificationsTakenByUser = await complementaryCertificationCourseRepository.findByUserId({
    userId,
  });

  const complementaryCertificationsAcquired = complementaryCertificationsTakenByUser.filter(
    (complementaryCertification) => complementaryCertification.isAcquired(),
  );

  const complementaryCertificationsEligibles = stillValidBadgeAcquisitions.map((stillValidBadgeAcquisition) => ({
    label: stillValidBadgeAcquisition.complementaryCertificationBadgeLabel,
    imageUrl: stillValidBadgeAcquisition.complementaryCertificationBadgeImageUrl,
    isOutdated: stillValidBadgeAcquisition.isOutdated,
    isAcquired: complementaryCertificationsAcquired.some(
      ({ complementaryCertificationBadgeId }) =>
        complementaryCertificationBadgeId === stillValidBadgeAcquisition.complementaryCertificationBadgeId,
    ),
  }));

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    complementaryCertifications: complementaryCertificationsEligibles,
  });
};

export { getUserCertificationEligibility };
