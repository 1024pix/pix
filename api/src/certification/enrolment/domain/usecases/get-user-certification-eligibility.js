/**
 * @typedef {import ('./index.js').EligibilityService} EligibilityService
 */

/**
 * @param {object} params
 * @param {EligibilityService} params.eligibilityService
 */
export async function getUserCertificationEligibility({
  userId,
  limitDate = new Date(),
  eligibilityService,
  placementProfileService,
  certificationBadgesService,
  complementaryCertificationCourseRepository,
  complementaryCertificationBadgeWithOffsetVersionRepository,
}) {
  return eligibilityService.getUserCertificationEligibility({
    userId,
    limitDate,
    placementProfileService,
    certificationBadgesService,
    complementaryCertificationCourseRepository,
    complementaryCertificationBadgeWithOffsetVersionRepository,
  });
}
