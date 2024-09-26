import _ from 'lodash';

import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';
import { CertificationCandidateEligibilityError } from '../errors.js';

export async function verifyCandidateEligibility({
  candidate,
  userId,
  sessionId,
  limitDate,
  sessionRepository,
  pixCertificationRepository,
  complementaryCertificationBadgeRepository,
  certificationBadgesService,
}) {
  const session = await sessionRepository.get({ id: sessionId });

  const isV2Certification = session.version === CERTIFICATION_VERSIONS.V2;

  const isV3CoreSubscriptionOnly =
    session.version === CERTIFICATION_VERSIONS.V3 &&
    candidate.subscriptions.length === 1 &&
    candidate.subscriptions[0]?.isCore();

  const isV3CleaSubscription = session.version === CERTIFICATION_VERSIONS.V3 && candidate.subscriptions.length === 2;

  if (isV2Certification || isV3CoreSubscriptionOnly || isV3CleaSubscription) {
    return true;
  }

  const userPixCertifications = await pixCertificationRepository.findByUserId({ userId });

  const hasUserValidatedAtLeastOneCoreCertification = _.some(
    userPixCertifications,
    (certification) =>
      certification.status === AssessmentResult.status.VALIDATED &&
      !certification.isCancelled &&
      !certification.isRejectedForFraud,
  );

  if (!userPixCertifications.length || !hasUserValidatedAtLeastOneCoreCertification) {
    throw new CertificationCandidateEligibilityError();
  }

  const validPixCertificationSortedByPixScore = _.chain(userPixCertifications)
    .filter(
      (pixCertification) =>
        pixCertification.status === AssessmentResult.status.VALIDATED &&
        !pixCertification.isCancelled &&
        !pixCertification.isRejectedForFraud,
    )
    .sortBy('pixScore')
    .value();

  const highestValidPixScore = _.get(validPixCertificationSortedByPixScore, '[0].pixScore');

  const userAcquiredBadges = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });

  const subscribedHighestBadgeAcquisition = _.find(
    userAcquiredBadges,
    ({ complementaryCertificationId }) =>
      candidate.subscriptions[0].complementaryCertificationId === complementaryCertificationId,
  );

  const complementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();

  const userComplementaryCertificationBadgesSortedByLevel = _.chain(complementaryCertificationBadges)
    .filter(
      ({ complementaryCertificationId }) =>
        candidate.subscriptions[0].complementaryCertificationId === complementaryCertificationId,
    )
    .sortBy('level')
    .value();

  const subscribedComplementaryCertificationBadge = _.find(
    userComplementaryCertificationBadgesSortedByLevel,
    (ccbadge) => ccbadge.id === subscribedHighestBadgeAcquisition?.complementaryCertificationBadgeId,
  );

  if (subscribedComplementaryCertificationBadge?.detachedAt !== null) {
    throw new CertificationCandidateEligibilityError();
  }

  if (subscribedComplementaryCertificationBadge) {
    const closestLowerLevelObj = _.chain(userComplementaryCertificationBadgesSortedByLevel)
      .filter((obj) => obj.level < subscribedComplementaryCertificationBadge.level)
      .maxBy('level')
      .value();

    if (closestLowerLevelObj && closestLowerLevelObj.minimumEarnedPix > highestValidPixScore) {
      throw new CertificationCandidateEligibilityError();
    } else if (subscribedComplementaryCertificationBadge.minimumEarnedPix > highestValidPixScore) {
      throw new CertificationCandidateEligibilityError();
    }
  }

  return true;
}
