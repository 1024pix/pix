import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import {
  DoubleCertificationEligibility,
  UserCertificationEligibility,
} from '../read-models/UserCertificationEligibility.js';

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

  const certifiableCompetencesCount = placementProfile.getCertifiableCompetencesCount();

  if (!isCertifiable) {
    return new UserCertificationEligibility({
      id: userId,
      isCertifiable,
      doubleCertificationEligibility,
      certifiableCompetencesCount,
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

    const hasSucceededDoubleCertification = _hasSucceededDoubleCertification(
      userComplementaryCertifications,
      acquiredComplementaryCertificationBadge,
    );

    const badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt =
      acquiredComplementaryCertificationBadge?.offsetVersion === 1 && !hasSucceededDoubleCertification;

    if (
      _isEligible({
        badgeIsOutdated,
        badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt,
      })
    ) {
      doubleCertificationEligibility = new DoubleCertificationEligibility({
        label: doubleCertificationBadge.complementaryCertificationBadgeLabel,
        imageUrl: doubleCertificationBadge.complementaryCertificationBadgeImageUrl,
        isEligible: !doubleCertificationBadge.isOutdated && !hasSucceededDoubleCertification,
        certificationAlreadySucceeded: hasSucceededDoubleCertification,
      });
    }
  }

  return new UserCertificationEligibility({
    id: userId,
    isCertifiable,
    doubleCertificationEligibility,
    certifiableCompetencesCount,
  });
}

function _isEligible({ badgeIsOutdated, badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt }) {
  return !badgeIsOutdated || badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt;
}

function _hasSucceededDoubleCertification(userComplementaryCertifications, acquiredComplementaryCertificationBadge) {
  return userComplementaryCertifications.some(
    (userComplementaryCertification) =>
      userComplementaryCertification.isAcquiredExpectedLevelByPixSource() &&
      acquiredComplementaryCertificationBadge?.id === userComplementaryCertification.complementaryCertificationBadgeId,
  );
}
