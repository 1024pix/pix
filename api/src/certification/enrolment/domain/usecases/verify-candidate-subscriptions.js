/**
 * @typedef {import ('./index.js').SessionRepository} SessionRepository
 * @typedef {import ('./index.js').PixCertificationRepository} PixCertificationRepository
 * @typedef {import ('./index.js').ComplementaryCertificationBadgesRepository} ComplementaryCertificationBadgesRepository
 * @typedef {import ('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('../../../../shared/domain/models/index.js').CertifiableBadgeAcquisition} CertifiableBadgeAcquisition
 */
import _ from 'lodash';

import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/index.js';
import { SessionVersion } from '../../../shared/domain/models/SessionVersion.js';
import { CertificationCandidateEligibilityError } from '../errors.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {PixCertificationRepository} params.pixCertificationRepository
 * @param {ComplementaryCertificationBadgesRepository} params.complementaryCertificationBadgesRepository
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
  complementaryCertificationBadgesRepository,
  placementProfileService,
  certificationBadgesService,
}) {
  const session = await sessionRepository.get({ id: sessionId });

  if (candidate.hasCoreSubscription()) {
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: candidate.userId,
      limitDate: candidate.reconciledAt,
    });

    if (!placementProfile.isCertifiable()) {
      throw new UserNotAuthorizedToCertifyError();
    }
  }

  if (_doesNeedEligibilityCheck(session, candidate)) {
    const userPixCertifications = await pixCertificationRepository.findByUserId({ userId: candidate.userId });

    if (!_hasValidCoreCertification(userPixCertifications)) {
      throw new CertificationCandidateEligibilityError();
    }

    const subscribedHighestBadgeAcquisition = await _findHighestBadgeAcquisitionForCandidateSubscription({
      candidate,
      certificationBadgesService,
    });

    if (!subscribedHighestBadgeAcquisition || _isSubscribedUserBadgeOutDated(subscribedHighestBadgeAcquisition)) {
      throw new CertificationCandidateEligibilityError();
    }

    const complementaryCertificationBadges =
      await complementaryCertificationBadgesRepository.getAllWithSameTargetProfile(
        subscribedHighestBadgeAcquisition.complementaryCertificationBadgeId,
      );

    const userComplementaryCertificationBadgesSortedByLevel =
      _getSubscribedComplementaryCertificationBadgesSortedByLevel({ complementaryCertificationBadges, candidate });

    const subscribedComplementaryCertificationBadge = _getSubscribedComplementaryCertificationBadge(
      userComplementaryCertificationBadgesSortedByLevel,
      subscribedHighestBadgeAcquisition,
    );

    const highestUserValidPixScore = _getHighestUserValidPixScore(userPixCertifications);
    if (
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

/**
 * @param {Object} params
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {Candidate} params.candidate
 * @returns {CertifiableBadgeAcquisition} highest badge acquired that the candidate has been subscribed to
 */
async function _findHighestBadgeAcquisitionForCandidateSubscription({ candidate, certificationBadgesService }) {
  const userAcquiredBadgeAcquisitions = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId: candidate.userId,
    limitDate: candidate.reconciledAt,
  });

  return _getSubscribedHighestBadgeAcquisition({
    userAcquiredBadgeAcquisitions,
    candidate,
  });
}

/**
 * @param {CertifiableBadgeAcquisition} subscribedBadgeAcquisition
 * @returns {boolean} true if badge exists and is tagged outdated
 */
function _isSubscribedUserBadgeOutDated(subscribedBadgeAcquisition) {
  return subscribedBadgeAcquisition?.isOutdated || false;
}

function _doesNeedEligibilityCheck(session, candidate) {
  return (
    SessionVersion.isV3(session.version) &&
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

/**
 * @param {Object} params
 * @param {Array<CertifiableBadgeAcquisition>} params.userAcquiredBadgeAcquisitions
 * @param {Candidate} params.candidate
 * @returns {CertifiableBadgeAcquisition} badge acquired that the candidate has been subscribed to
 */
function _getSubscribedHighestBadgeAcquisition({ userAcquiredBadgeAcquisitions, candidate }) {
  return _.find(
    userAcquiredBadgeAcquisitions,
    ({ complementaryCertificationId }) =>
      candidate.subscriptions[0].complementaryCertificationId === complementaryCertificationId,
  );
}

/**
 * @param {Object} params
 * @param {Array<ComplementaryCertificationBadge>} params.complementaryCertificationBadges
 * @param {Candidate} params.candidate
 * @returns {CertifiableBadgeAcquisition} badge acquired that the candidate has been subscribed to
 */
function _getSubscribedComplementaryCertificationBadgesSortedByLevel({ complementaryCertificationBadges, candidate }) {
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
