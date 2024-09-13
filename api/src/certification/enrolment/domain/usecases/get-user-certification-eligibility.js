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
  const complementaryCertificationAcquiredByUser = await complementaryCertificationCourseRepository.findByUserId({
    userId,
  });
  const userPixCertifications = await pixCertificationRepository.findByUserId({ userId });
  const allComplementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();

  const certificationEligibilities = [];
  for (const acquiredBadge of userAcquiredBadges) {
    let areEligibilityConditionsFulfilled = false;
    const isClea = acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA;
    if (isClea) {
      areEligibilityConditionsFulfilled = isCertifiable;
    } else {
      areEligibilityConditionsFulfilled = _checkComplementaryEligibilityConditions(
        allComplementaryCertificationBadges,
        userPixCertifications,
        acquiredBadge.complementaryCertificationBadgeId,
      );
    }

    const isAcquiredExpectedLevel = _hasAcquiredComplementaryCertificationForExpectedLevel(
      complementaryCertificationAcquiredByUser,
      acquiredBadge,
    );
    const badgeIsNotOutdated = acquiredBadge.offsetVersion === 0;
    const badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt =
      acquiredBadge.offsetVersion === 1 && !isAcquiredExpectedLevel;

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
