import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { CertificationEligibility, UserCertificationEligibility } from '../read-models/UserCertificationEligibility.js';

export async function getUserCertificationEligibility({
  userId,
  limitDate,
  placementProfileService,
  certificationBadgesService,
  complementaryCertificationCourseRepository,
  complementaryCertificationBadgeWithOffsetVersionRepository,
}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate });
  const isCertifiable = placementProfile.isCertifiable();
  let doubleCertificationEligibility = null;

  if (!isCertifiable) {
    return new UserCertificationEligibility({
      id: userId,
      isCertifiable,
      doubleCertificationEligibility,
    });
  }

  const userAcquiredBadges = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });

  const [doubleCertificationBadge] = userAcquiredBadges.filter(
    (acquiredBadge) => acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA,
  );

  if (doubleCertificationBadge) {
    const allComplementaryCertificationBadgesForSameTargetProfile =
      await complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile({
        complementaryCertificationBadgeId: doubleCertificationBadge.complementaryCertificationBadgeId,
      });
    const acquiredComplementaryCertificationBadge = allComplementaryCertificationBadgesForSameTargetProfile.find(
      ({ id }) => id === doubleCertificationBadge.complementaryCertificationBadgeId,
    );

    const badgeIsOutdated = acquiredComplementaryCertificationBadge?.offsetVersion !== 0;

    const userComplementaryCertifications = await complementaryCertificationCourseRepository.findByUserId({
      userId,
    });

    const hasValidatedDoubleCertification = _hasValidatedDoubleCertification(
      userComplementaryCertifications,
      acquiredComplementaryCertificationBadge,
    );

    const badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt =
      acquiredComplementaryCertificationBadge?.offsetVersion === 1 && !hasValidatedDoubleCertification;

    if (
      _isEligible({
        badgeIsOutdated,
        badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt,
      })
    ) {
      doubleCertificationEligibility = new CertificationEligibility({
        label: doubleCertificationBadge.complementaryCertificationBadgeLabel,
        imageUrl: doubleCertificationBadge.complementaryCertificationBadgeImageUrl,
        isBadgeValid: !doubleCertificationBadge.isOutdated,
        validatedDoubleCertification: hasValidatedDoubleCertification,
      });
    }
  }

  return new UserCertificationEligibility({
    id: userId,
    isCertifiable,
    doubleCertificationEligibility,
  });
}

function _isEligible({ badgeIsOutdated, badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt }) {
  return !badgeIsOutdated || badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt;
}

function _hasValidatedDoubleCertification(userComplementaryCertifications, acquiredComplementaryCertificationBadge) {
  return userComplementaryCertifications.some(
    (userComplementaryCertification) =>
      userComplementaryCertification.isAcquiredExpectedLevelByPixSource() &&
      acquiredComplementaryCertificationBadge?.id === userComplementaryCertification.complementaryCertificationBadgeId,
  );
}
