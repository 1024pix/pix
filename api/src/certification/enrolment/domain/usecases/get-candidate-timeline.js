// @ts-check
/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import ('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import ('../models/timeline/TimelineEvent.js').TimelineEvent} TimelineEvent
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('../models/Candidate.js').Subscription} Subscription
 * @typedef {import ('../../../shared/domain/models/CertificationCourse.js').CertificationCourse} CertificationCourse
 * @typedef {import ('../../../session-management/domain/models/CertificationAssessment.js').CertificationAssessment} CertificationAssessment
 */

import { FRENCH_FRANCE } from '../../../../shared/domain/services/locale-service.js';
import { CandidateCertifiableEvent } from '../models/timeline/CandidateCertifiableEvent.js';
import { CandidateCreatedEvent } from '../models/timeline/CandidateCreatedEvent.js';
import { CandidateEndScreenEvent } from '../models/timeline/CandidateEndScreenEvent.js';
import { CandidateNotCertifiableEvent } from '../models/timeline/CandidateNotCertifiableEvent.js';
import { CandidateReconciledEvent } from '../models/timeline/CandidateReconciledEvent.js';
import { CandidateTimeline } from '../models/timeline/CandidateTimeline.js';
import { CertificationEndedEvent } from '../models/timeline/CertificationEndedEvent.js';
import { CertificationStartedEvent } from '../models/timeline/CertificationStartedEvent.js';
import { ComplementaryCertifiableEvent } from '../models/timeline/ComplementaryCertifiableEvent.js';
import { ComplementaryNotCertifiableEvent } from '../models/timeline/ComplementaryNotCertifiableEvent.js';

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {number} params.certificationCandidateId
 * @param {CandidateRepository} params.candidateRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {PlacementProfileService} params.placementProfileService
 * @returns {Promise<CandidateTimeline>}
 */
export const getCandidateTimeline = async ({
  certificationCandidateId,
  candidateRepository,
  certificationCourseRepository,
  certificationAssessmentRepository,
  certificationBadgesService,
  placementProfileService,
}) => {
  const timeline = new CandidateTimeline({ certificationCandidateId });

  const candidate = await candidateRepository.get({ certificationCandidateId });
  timeline.addEvent(new CandidateCreatedEvent({ when: candidate.createdAt }));

  if (!candidate.isReconciled()) {
    return timeline;
  }

  timeline.addEvent(new CandidateReconciledEvent({ when: candidate.reconciledAt }));

  const certificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
    userId: candidate.userId,
    sessionId: candidate.sessionId,
  });

  if (!certificationCourse) {
    const events = await _whenCandidateDidNotStartCertification({
      candidate,
      placementProfileService,
      certificationBadgesService,
    });
    events.forEach((event) => timeline.addEvent(event));
    return timeline;
  }

  timeline.addEvent(new CertificationStartedEvent({ when: certificationCourse.getStartDate() }));
  const events = await _whenCandidateHasStartedTheTest({
    candidate,
    certificationCourse,
    placementProfileService,
    certificationBadgesService,
  });
  events.forEach((event) => timeline.addEvent(event));

  if (certificationCourse.isCompleted()) {
    timeline.addEvent(new CandidateEndScreenEvent({ when: certificationCourse._completedAt }));
    return timeline;
  }

  const assessment = await certificationAssessmentRepository.getByCertificationCandidateId({
    certificationCandidateId,
  });
  if (assessment.endedAt) {
    timeline.addEvent(new CertificationEndedEvent({ when: assessment.endedAt, assessmentState: assessment.state }));
  }

  return timeline;
};

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @param {PlacementProfileService} params.placementProfileService
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @returns {Promise<Array<TimelineEvent>>}
 */
const _whenCandidateDidNotStartCertification = async ({
  candidate,
  placementProfileService,
  certificationBadgesService,
}) => {
  const certificabilityEvent = await _getCertificabilityEvent({
    userId: candidate.userId,
    atDate: candidate.reconciledAt,
    placementProfileService,
  });

  const complementaryEligibilityEvent = await _getComplementaryEligibilityEvent({
    userId: candidate.userId,
    atDate: candidate.reconciledAt,
    subscriptions: candidate.subscriptions,
    certificationBadgesService,
  });

  return [certificabilityEvent].concat(complementaryEligibilityEvent);
};

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @param {CertificationCourse} params.certificationCourse
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {PlacementProfileService} params.placementProfileService
 * @returns {Promise<Array<TimelineEvent>>}
 */
const _whenCandidateHasStartedTheTest = async ({
  candidate,
  certificationCourse,
  certificationBadgesService,
  placementProfileService,
}) => {
  const certificabilityEvent = await _getCertificabilityEvent({
    userId: certificationCourse.getUserId(),
    atDate: certificationCourse.getStartDate(),
    placementProfileService,
  });

  const complementaryEligibilityEvent = await _getComplementaryEligibilityEvent({
    userId: certificationCourse.getUserId(),
    atDate: certificationCourse.getStartDate(),
    subscriptions: candidate.subscriptions,
    certificationBadgesService,
  });

  return [certificabilityEvent].concat(complementaryEligibilityEvent);
};

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {Date} params.atDate
 * @param {PlacementProfileService} params.placementProfileService
 * @returns {Promise<TimelineEvent>}
 */
const _getCertificabilityEvent = async ({ userId, atDate, placementProfileService }) => {
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: userId,
    limitDate: atDate,
    locale: FRENCH_FRANCE,
  });

  if (!placementProfile.isCertifiable()) {
    return new CandidateNotCertifiableEvent({ when: atDate });
  }

  return new CandidateCertifiableEvent({ when: atDate });
};

/**
 * @param {Object} params
 * @param {Array<Subscription>} params.subscriptions
 * @param {number} params.userId
 * @param {Date} params.atDate
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @returns {Promise<Array<TimelineEvent>>}
 */
const _getComplementaryEligibilityEvent = async ({
  userId,
  atDate,
  subscriptions = [],
  certificationBadgesService,
}) => {
  const onlyCoreSubscription = () => subscriptions.length === 1 && subscriptions[0].isCore();
  if (onlyCoreSubscription()) {
    return [];
  }

  const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId,
    limitDate: atDate,
  });

  const findBadge = (subscription) => {
    return highestCertifiableBadgeAcquisitions.find(
      (badge) => subscription.complementaryCertificationId === badge.complementaryCertificationId,
    );
  };

  const events = [];
  subscriptions
    .filter((subscription) => subscription.isComplementary())
    .forEach((subscription) => {
      const badge = findBadge(subscription);
      if (badge) {
        events.push(
          new ComplementaryCertifiableEvent({
            when: atDate,
            complementaryCertificationKey: badge.complementaryCertificationKey,
          }),
        );
      } else {
        events.push(
          new ComplementaryNotCertifiableEvent({
            when: atDate,
            complementaryCertificationId: subscription.complementaryCertificationId,
          }),
        );
      }
    });

  return events;
};
