/**
 * @typedef {import ('./index.js').ComplementaryCertificationBadgeWithOffsetVersionRepository} ComplementaryCertificationBadgeWithOffsetVersionRepository
 */
import _ from 'lodash';

import { AssessmentResult } from '../../../../shared/domain/models/index.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { CertificationEligibility, UserCertificationEligibility } from '../read-models/UserCertificationEligibility.js';

/**
 * @param {Object} params
 * @param {ComplementaryCertificationBadgeWithOffsetVersionRepository} params.complementaryCertificationBadgeWithOffsetVersionRepository
 */
const getUserCertificationEligibility = async function ({
  userId,
  limitDate = new Date(),
  placementProfileService,
  certificationBadgesService,
  complementaryCertificationCourseRepository,
  pixCertificationRepository,
  complementaryCertificationBadgeWithOffsetVersionRepository,
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

  const certificationEligibilities = [];
  for (const acquiredBadge of userAcquiredBadges) {
    const allComplementaryCertificationBadgesForSameTargetProfile =
      await complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile({
        complementaryCertificationBadgeId: acquiredBadge.complementaryCertificationBadgeId,
      });
    const acquiredComplementaryCertificationBadge = allComplementaryCertificationBadgesForSameTargetProfile.find(
      ({ id }) => id === acquiredBadge.complementaryCertificationBadgeId,
    );
    let areEligibilityConditionsFulfilledForCurrentLevel = false;
    let areEligibilityConditionsFulfilledForLowerLevel = false;
    const isClea = acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA;

    const validatedUserPixCertifications = userPixCertifications.filter(
      (pixCertification) =>
        !pixCertification.isCancelled &&
        !pixCertification.isRejectedForFraud &&
        pixCertification.status === AssessmentResult.status.VALIDATED,
    );

    const lowerLevelAcquiredBadgeWithOffsetVersion = _getLowerLevelBadge(
      allComplementaryCertificationBadgesForSameTargetProfile,
      acquiredBadge,
    );

    if (isClea) {
      areEligibilityConditionsFulfilledForCurrentLevel = isCertifiable;
    } else if (validatedUserPixCertifications.length === 0) {
      areEligibilityConditionsFulfilledForCurrentLevel = false;
      areEligibilityConditionsFulfilledForLowerLevel = false;
    } else {
      areEligibilityConditionsFulfilledForCurrentLevel = _checkComplementaryEligibilityConditions({
        validatedUserPixCertifications,
        complementaryCertificationBadge: acquiredComplementaryCertificationBadge,
      });

      areEligibilityConditionsFulfilledForLowerLevel = _checkComplementaryEligibilityConditions({
        validatedUserPixCertifications,
        complementaryCertificationBadge: lowerLevelAcquiredBadgeWithOffsetVersion,
      });
    }

    const isAcquiredExpectedLevel = _hasAcquiredComplementaryCertificationForExpectedLevel(
      complementaryCertificationCourseWithResultsAcquiredByUser,
      acquiredComplementaryCertificationBadge,
    );
    const badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt =
      acquiredComplementaryCertificationBadge?.offsetVersion === 1 && !isAcquiredExpectedLevel;
    const badgeIsNotOutdated = acquiredComplementaryCertificationBadge?.offsetVersion === 0;

    if (
      _isEligibleForCurrentLevel({
        badgeIsNotOutdated,
        badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt,
        areEligibilityConditionsFulfilledForCurrentLevel,
      })
    ) {
      certificationEligibilities.push(
        new CertificationEligibility({
          label: acquiredBadge.complementaryCertificationBadgeLabel,
          imageUrl: acquiredBadge.complementaryCertificationBadgeImageUrl,
          isOutdated: acquiredBadge.isOutdated,
          isAcquiredExpectedLevel,
        }),
      );
    } else if (
      _isEligibleForLowerLevel({
        badgeIsNotOutdated,
        badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt,
        areEligibilityConditionsFulfilledForLowerLevel,
      })
    ) {
      certificationEligibilities.push(
        new CertificationEligibility({
          label: lowerLevelAcquiredBadgeWithOffsetVersion.label,
          imageUrl: lowerLevelAcquiredBadgeWithOffsetVersion.imageUrl,
          isOutdated: lowerLevelAcquiredBadgeWithOffsetVersion.isOutdated,
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

function _isEligibleForLowerLevel({
  badgeIsNotOutdated,
  badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt,
  areEligibilityConditionsFulfilledForLowerLevel,
}) {
  return (
    (badgeIsNotOutdated || badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt) &&
    areEligibilityConditionsFulfilledForLowerLevel
  );
}

function _isEligibleForCurrentLevel({
  badgeIsNotOutdated,
  badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt,
  areEligibilityConditionsFulfilledForCurrentLevel,
}) {
  return (
    (badgeIsNotOutdated || badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt) &&
    areEligibilityConditionsFulfilledForCurrentLevel
  );
}

function _checkComplementaryEligibilityConditions({ validatedUserPixCertifications, complementaryCertificationBadge }) {
  if (!complementaryCertificationBadge) {
    return false;
  }

  const requiredScore = complementaryCertificationBadge.requiredPixScore;

  const highestObtainedScore = _.maxBy(validatedUserPixCertifications, 'pixScore').pixScore;
  return highestObtainedScore >= requiredScore;
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

function _getLowerLevelBadge(allComplementaryCertificationBadgesForSameTargetProfile, acquiredBadge) {
  return _.chain(allComplementaryCertificationBadgesForSameTargetProfile)
    .sortBy('level')
    .filter((badge) => badge.id != acquiredBadge.complementaryCertificationBadgeId)
    .maxBy('level')
    .value();
}

export { getUserCertificationEligibility };
