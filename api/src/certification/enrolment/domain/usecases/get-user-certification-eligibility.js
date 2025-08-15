/**
 * @typedef {import ('./index.js').ComplementaryCertificationBadgeWithOffsetVersionRepository} ComplementaryCertificationBadgeWithOffsetVersionRepository
 */

import * as injectedPlacementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import * as injectedCertificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as injectedComplementaryCertificationBadgeWithOffsetVersionRepository from '../../infrastructure/repositories/complementary-certification-badge-with-offset-version-repository.js';
import * as injectedComplementaryCertificationCourseRepository from '../../infrastructure/repositories/complementary-certification-course-repository.js';
import { CertificationEligibility, UserCertificationEligibility } from '../read-models/UserCertificationEligibility.js';

/**
 * @param {Object} params
 * @param {ComplementaryCertificationBadgeWithOffsetVersionRepository} params.complementaryCertificationBadgeWithOffsetVersionRepository
 */
const getUserCertificationEligibility = async function ({
  userId,
  limitDate = new Date(),
  placementProfileService = injectedPlacementProfileService,
  certificationBadgesService = injectedCertificationBadgesService,
  complementaryCertificationCourseRepository = injectedComplementaryCertificationCourseRepository,
  complementaryCertificationBadgeWithOffsetVersionRepository = injectedComplementaryCertificationBadgeWithOffsetVersionRepository,
} = {}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate });
  const isCertifiable = placementProfile.isCertifiable();

  if (!isCertifiable) {
    return new UserCertificationEligibility({
      id: userId,
      isCertifiable,
      certificationEligibilities: [],
    });
  }

  const userAcquiredBadges = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });

  const [doubleCertificationBadge] = userAcquiredBadges.filter(
    (acquiredBadge) => acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA,
  );

  const certificationEligibilities = [];

  if (doubleCertificationBadge) {
    const allComplementaryCertificationBadgesForSameTargetProfile =
      await complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile({
        complementaryCertificationBadgeId: doubleCertificationBadge.complementaryCertificationBadgeId,
      });
    const acquiredComplementaryCertificationBadge = allComplementaryCertificationBadgesForSameTargetProfile.find(
      ({ id }) => id === doubleCertificationBadge.complementaryCertificationBadgeId,
    );

    const complementaryCertificationCourseWithResultsAcquiredByUser =
      await complementaryCertificationCourseRepository.findByUserId({
        userId,
      });

    const isAcquiredExpectedLevel = _hasAcquiredComplementaryCertificationForExpectedLevel(
      complementaryCertificationCourseWithResultsAcquiredByUser,
      acquiredComplementaryCertificationBadge,
    );
    const badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt =
      acquiredComplementaryCertificationBadge?.offsetVersion === 1 && !isAcquiredExpectedLevel;
    const badgeIsNotOutdated = acquiredComplementaryCertificationBadge?.offsetVersion === 0;

    if (
      _isEligible({
        badgeIsNotOutdated,
        badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt,
      })
    ) {
      certificationEligibilities.push(
        new CertificationEligibility({
          label: doubleCertificationBadge.complementaryCertificationBadgeLabel,
          imageUrl: doubleCertificationBadge.complementaryCertificationBadgeImageUrl,
          isOutdated: doubleCertificationBadge.isOutdated,
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

function _isEligible({ badgeIsNotOutdated, badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt }) {
  return badgeIsNotOutdated || badgeIsOutdatedByOneVersionAndUserHasNoComplementaryCertificationForIt;
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
