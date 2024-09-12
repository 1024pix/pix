import { CertificationEligibility, UserCertificationEligibility } from '../read-models/UserCertificationEligibility.js';

const getUserCertificationEligibility = async function ({
  userId,
  limitDate,
  placementProfileService,
  certificationBadgesService,
  complementaryCertificationCourseRepository,
}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate });
  const isCertifiable = placementProfile.isCertifiable();

  const userAcquiredBadges = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });
  const certificationEligibilities = [];
  const complementaryCertificationAcquiredByUser = await complementaryCertificationCourseRepository.findByUserId({
    userId,
  });
  for (const acquiredBadge of userAcquiredBadges) {
    const isAcquiredExpectedLevel = _hasAcquiredComplementaryCertificationForExpectedLevel(
      complementaryCertificationAcquiredByUser,
      acquiredBadge,
    );

    const badgeIsNotOutdated = acquiredBadge.offsetVersion === 0;
    const badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt =
      acquiredBadge.offsetVersion === 1 && !isAcquiredExpectedLevel;

    if (badgeIsNotOutdated || badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt) {
      certificationEligibilities.push(
        new CertificationEligibility({
          label: acquiredBadge.complementaryCertificationBadgeLabel,
          imageUrl: acquiredBadge.complementaryCertificationBadgeImageUrl,
          isOutdated: acquiredBadge.isOutdated,
          isAcquiredExpectedLevel,
        }),
      );
    }
  }

  return new UserCertificationEligibility({
    id: userId,
    isCertifiable,
    certificationEligibilities,
  });
};

function _hasAcquiredComplementaryCertificationForExpectedLevel(
  complementaryCertificationAcquiredByUser,
  acquiredBadge,
) {
  return complementaryCertificationAcquiredByUser.some(
    (certificationTakenByUser) =>
      certificationTakenByUser.isAcquiredExpectedLevelByPixSource() &&
      acquiredBadge.complementaryCertificationBadgeId === certificationTakenByUser.complementaryCertificationBadgeId,
  );
}

export { getUserCertificationEligibility };
