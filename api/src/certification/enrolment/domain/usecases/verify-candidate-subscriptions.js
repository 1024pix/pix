/**
 * @typedef {import ('./index.js').SessionRepository} SessionRepository
 * @typedef {import ('./index.js').PixCertificationRepository} PixCertificationRepository
 * @typedef {import ('./index.js').ComplementaryCertificationBadgeRepository} ComplementaryCertificationBadgeRepository
 * @typedef {import ('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 */
import _ from 'lodash';

import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/index.js';
import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';
import { CertificationCandidateEligibilityError } from '../errors.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {PixCertificationRepository} params.pixCertificationRepository
 * @param {ComplementaryCertificationBadgeRepository} params.complementaryCertificationBadgeRepository
 * @param {PlacementProfileService} params.placementProfileService
 * @param {CertificationBadgesService} params.certificationBadgesService
 *
 * @returns {Promise<void>} if candidate is deemed eligible
 * @throws {UserNotAuthorizedToCertifyError} candidate is not certifiable for CORE
 * @throws {CertificationCandidateEligibilityError} candidate is not eligibile to his complementary
 */
export async function verifyCandidateSubscriptions({
  candidate,
  sessionId,
  sessionRepository,
  pixCertificationRepository,
  complementaryCertificationBadgeRepository,
  placementProfileService,
  certificationBadgesService,
}) {
  const session = await sessionRepository.get({ id: sessionId });
  const { userId } = candidate;

  if (candidate.hasCoreSubscription()) {
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId,
      limitDate: candidate.reconciledAt,
    });

    if (!placementProfile.isCertifiable()) {
      throw new UserNotAuthorizedToCertifyError();
    }
  }

  if (_doesNeedEligibilityCheck(session, candidate)) {
    const userPixCertifications = await pixCertificationRepository.findByUserId({ userId });

    if (!_hasValidCoreCertification(userPixCertifications)) {
      throw new CertificationCandidateEligibilityError();
    }

    const highestUserValidPixScore = _getHighestUserValidPixScore(userPixCertifications);

    const userAcquiredBadges = await certificationBadgesService.findLatestBadgeAcquisitions({
      userId,
      limitDate: candidate.reconciledAt,
    });

    const subscribedHighestBadgeAcquisition = _getSubscribedHighestBadgeAcquisition(userAcquiredBadges, candidate);

    const complementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();

    const userComplementaryCertificationBadgesSortedByLevel =
      _getSubscribedComplementaryCertificationBadgesSortedByLevel(complementaryCertificationBadges, candidate);

    const subscribedComplementaryCertificationBadge = _getSubscribedComplementaryCertificationBadge(
      userComplementaryCertificationBadgesSortedByLevel,
      subscribedHighestBadgeAcquisition,
    );

    if (
      _isSubscribedUserBadgeOutDated(subscribedComplementaryCertificationBadge) ||
      !_isUserPixScoreSufficientForBadge({
        subscribedComplementaryCertificationBadge,
        userComplementaryCertificationBadgesSortedByLevel,
        highestUserValidPixScore,
      })
    ) {
      throw new CertificationCandidateEligibilityError();
    }
  }
}

function _isSubscribedUserBadgeOutDated(subscribedComplementaryCertificationBadge) {
  return subscribedComplementaryCertificationBadge?.detachedAt !== null;
}

function _doesNeedEligibilityCheck(session, candidate) {
  return (
    session.version === CERTIFICATION_VERSIONS.V3 &&
    candidate.subscriptions.length === 1 &&
    candidate.subscriptions[0]?.isComplementary()
  );
}

function _hasValidCoreCertification(userPixCertifications) {
  return _.some(
    userPixCertifications,
    (certification) =>
      certification.status === AssessmentResult.status.VALIDATED &&
      !certification.isCancelled &&
      !certification.isRejectedForFraud,
  );
}

function _getHighestUserValidPixScore(userPixCertifications) {
  const validPixCertifications = _.chain(userPixCertifications)
    .filter(
      (pixCertification) =>
        pixCertification.status === AssessmentResult.status.VALIDATED &&
        !pixCertification.isCancelled &&
        !pixCertification.isRejectedForFraud,
    )
    .sortBy('pixScore')
    .value();

  return _.get(validPixCertifications, '[0].pixScore');
}

function _getSubscribedHighestBadgeAcquisition(userAcquiredBadges, candidate) {
  return _.find(
    userAcquiredBadges,
    ({ complementaryCertificationId }) =>
      candidate.subscriptions[0].complementaryCertificationId === complementaryCertificationId,
  );
}

function _getSubscribedComplementaryCertificationBadgesSortedByLevel(complementaryCertificationBadges, candidate) {
  return _.chain(complementaryCertificationBadges)
    .filter(
      ({ complementaryCertificationId }) =>
        candidate.subscriptions[0].complementaryCertificationId === complementaryCertificationId,
    )
    .sortBy('level')
    .value();
}

function _getSubscribedComplementaryCertificationBadge(
  userComplementaryCertificationBadgesSortedByLevel,
  subscribedHighestBadgeAcquisition,
) {
  return _.find(
    userComplementaryCertificationBadgesSortedByLevel,
    (ccbadge) => ccbadge.id === subscribedHighestBadgeAcquisition?.complementaryCertificationBadgeId,
  );
}

function _getLowerLevelBadge(userComplementaryCertificationBadgesSortedByLevel, subscribedBadge) {
  return _.chain(userComplementaryCertificationBadgesSortedByLevel)
    .filter((badge) => badge.level < subscribedBadge.level)
    .maxBy('level')
    .value();
}

function _isUserPixScoreSufficientForBadge({
  subscribedComplementaryCertificationBadge,
  userComplementaryCertificationBadgesSortedByLevel,
  highestUserValidPixScore,
}) {
  const lowerLevelBadge = _getLowerLevelBadge(
    userComplementaryCertificationBadgesSortedByLevel,
    subscribedComplementaryCertificationBadge,
  );

  const requiredScore = _computeRequiredScore({
    lowerLevelBadge,
    subscribedComplementaryCertificationBadge,
  });

  return highestUserValidPixScore >= requiredScore;
}

function _computeRequiredScore({ lowerLevelBadge, subscribedComplementaryCertificationBadge }) {
  if (lowerLevelBadge?.minimumEarnedPix) {
    return lowerLevelBadge.minimumEarnedPix;
  }

  if (subscribedComplementaryCertificationBadge?.minimumEarnedPix) {
    return subscribedComplementaryCertificationBadge.minimumEarnedPix;
  }

  return 0;
}
