/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationCourseRepository} ComplementaryCertificationCourseRepository
 * @typedef {import ('../../domain/usecases/index.js').PlacementProfileService} PlacementProfileService
 */
import { CertificationEligibility } from '../read-models/CertificationEligibility.js';

/**
 * @param {Object} params
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {ComplementaryCertificationCourseRepository} params.complementaryCertificationCourseRepository
 * @param {PlacementProfileService} params.placementProfileService
 *
 * @returns {CertificationEligibility}
 */
const getUserCertificationEligibility = async function ({
  userId,
  limitDate = new Date(),
  placementProfileService,
  certificationBadgesService,
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
