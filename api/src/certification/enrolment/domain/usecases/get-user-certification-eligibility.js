import _ from 'lodash';

import { AssessmentResult } from '../../../../shared/domain/models/index.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { CertificationEligibility, UserCertificationEligibility } from '../read-models/UserCertificationEligibility.js';

const getUserCertificationEligibility = async function ({
  userId,
  limitDate = new Date(),
  placementProfileService,
  certificationBadgesService,
  complementaryCertificationCourseRepository,
  pixCertificationRepository,
  complementaryCertificationBadgeRepository,
}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate });
  const isCertifiable = placementProfile.isCertifiable();

  const userAcquiredBadges = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });
  const complementaryCertificationCourseWithResultsAcquiredByUser =
    await complementaryCertificationCourseRepository.findByUserId({
      userId,
    });
  const userPixCertifications = await pixCertificationRepository.findByUserId({ userId });
  const allComplementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();

  const certificationEligibilities = [];
  for (const acquiredBadge of userAcquiredBadges) {
    const acquiredComplementaryCertificationBadge = allComplementaryCertificationBadges.find(
      ({ id }) => id === acquiredBadge.complementaryCertificationBadgeId,
    );
    let areEligibilityConditionsFulfilled = false;
    const isClea = acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA;
    if (isClea) {
      areEligibilityConditionsFulfilled = isCertifiable;
    } else {
      areEligibilityConditionsFulfilled = _checkComplementaryEligibilityConditions(
        allComplementaryCertificationBadges,
        userPixCertifications,
        acquiredComplementaryCertificationBadge.id,
      );
    }

    const isAcquiredExpectedLevel = _hasAcquiredComplementaryCertificationForExpectedLevel(
      complementaryCertificationCourseWithResultsAcquiredByUser,
      acquiredComplementaryCertificationBadge,
    );
    const badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt =
      acquiredComplementaryCertificationBadge?.offsetVersion === 1 && !isAcquiredExpectedLevel;
    const badgeIsNotOutdated = acquiredComplementaryCertificationBadge?.offsetVersion === 0;

    if (
      (badgeIsNotOutdated || badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt) &&
      areEligibilityConditionsFulfilled
    ) {
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

function _checkComplementaryEligibilityConditions(
  allComplementaryCertificationBadges,
  userPixCertifications,
  complementaryCertificationBadgeId,
) {
  const scoreRequired = allComplementaryCertificationBadges.find(
    (complementaryCertificationBadge) => complementaryCertificationBadge.id === complementaryCertificationBadgeId,
  ).requiredPixScore;
  const validatedUserPixCertifications = userPixCertifications.filter(
    (pixCertification) =>
      !pixCertification.isCancelled &&
      !pixCertification.isRejectedForFraud &&
      pixCertification.status === AssessmentResult.status.VALIDATED,
  );
  if (validatedUserPixCertifications.length === 0) {
    return false;
  } else {
    const highestObtainedScore = _.maxBy(validatedUserPixCertifications, 'pixScore').pixScore;
    return highestObtainedScore >= scoreRequired;
  }
}

function _hasAcquiredComplementaryCertificationForExpectedLevel(
  complementaryCertificationCourseWithResultsAcquiredByUser,
  acquiredComplementaryCertificationBadge,
) {
  return complementaryCertificationCourseWithResultsAcquiredByUser.some(
    (certificationTakenByUser) =>
      certificationTakenByUser.isAcquiredExpectedLevelByPixSource() &&
      acquiredComplementaryCertificationBadge?.id === certificationTakenByUser.complementaryCertificationBadgeId,
  );
}

export { getUserCertificationEligibility };
