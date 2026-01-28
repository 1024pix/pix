/**
 * @typedef {import('../../models/Candidate.js')} Candidate
 * @typedef {import('../../models/FlashAssessmentAlgorithm.js')} FlashAssessmentAlgorithm
 * @typedef {import('../../../../shared/domain/models/V3CertificationScoring.js')} V3CertificationScoring
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../../../../shared/domain/models/AssessmentResult.js')} AssessmentResult
 * @typedef {import('../../models/AssessmentSheet.js')} AssessmentSheet
 * @typedef {import('../../models/ComplementaryCertificationScoringCriteria.js')} ComplementaryCertificationScoringCriteria
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 * @typedef {import('../../../../../shared/domain/events/CertificationCourseUnrejected.js').CertificationCourseUnrejected} CertificationCourseUnrejected
 * @typedef {import('../../../../../shared/domain/events/CertificationUncancelled.js').default} CertificationUncancelled
 * @typedef {import('../../../../session-management/domain/events/CertificationCourseRejected.js').CertificationCourseRejected} CertificationCourseRejected
 * @typedef {import('../../../../session-management/domain/events/CertificationJuryDone.js').CertificationJuryDone} CertificationJuryDone
 * @typedef {import('../../events/CertificationRescored.js').default} CertificationRescored
 * @typedef {CertificationJuryDone | CertificationCourseRejected | CertificationCourseUnrejected | CertificationCancelled | CertificationRescored | CertificationUncancelled} CertificationRescoringEvent
 */

import CertificationCancelled from '../../../../../shared/domain/events/CertificationCancelled.js';
import { CertificationAssessmentScoreV3 } from '../../../../scoring/domain/models/CertificationAssessmentScoreV3.js';
import { CoreScoring } from '../../models/CoreScoring.js';
import { DoubleCertificationScoring } from '../../models/DoubleCertificationScoring.js';
import { createV3AssessmentResult } from './create-v3-assessment-result.js';

export const handleV3CertificationScoring =
  /**
   * @param {object} params
   * @param {CertificationRescoringEvent} [params.event]
   * @param {Candidate} params.candidate
   * @param {AssessmentSheet} params.assessmentSheet
   * @param {FlashAssessmentAlgorithm} params.algorithm
   * @param {V3CertificationScoring} params.v3CertificationScoring
   * @param {Array<CalibratedChallenge>} params.allChallenges
   * @param {Array<CalibratedChallenge>} params.askedChallengesWithoutLiveAlerts
   * @param {ComplementaryCertificationScoringCriteria} params.cleaScoringCriteria
   * @param {ScoringDegradationService} params.scoringDegradationService
   *
   * @return {Promise<undefined | CoreScoring | Object<CoreScoring, DoubleCertificationScoring>>}
   */
  ({
    event,
    candidate,
    assessmentSheet,
    allChallenges,
    askedChallengesWithoutLiveAlerts,
    algorithm,
    v3CertificationScoring,
    cleaScoringCriteria,
    scoringDegradationService,
  }) => {
    if (candidate.hasPixPlusSubscription) {
      return; // WIP : will be done in the future
    }

    if (candidate.hasOnlyCoreSubscription) {
      return _scoreCoreCertification({
        event,
        assessmentSheet,
        algorithm,
        v3CertificationScoring,
        allChallenges,
        askedChallengesWithoutLiveAlerts,
        scoringDegradationService,
      });
    }

    if (candidate.hasCleaSubscription) {
      const coreScoring = _scoreCoreCertification({
        event,
        assessmentSheet,
        algorithm,
        v3CertificationScoring,
        allChallenges,
        askedChallengesWithoutLiveAlerts,
        scoringDegradationService,
      });

      const doubleCertificationScoring = _scoreDoubleCertification({
        assessmentSheet,
        assessmentResult: coreScoring.assessmentResult,
        cleaScoringCriteria,
      });
      return { coreScoring, doubleCertificationScoring };
    }
  };

/**
 * @param {object} params
 * @param {CertificationRescoringEvent} [params.event]
 * @param {AssessmentSheet} params.assessmentSheet
 * @param {FlashAssessmentAlgorithm} params.algorithm
 * @param {V3CertificationScoring} params.v3CertificationScoring
 * @param {Array<CalibratedChallenge>} params.allChallenges
 * @param {Array<CalibratedChallenge>} params.askedChallengesWithoutLiveAlerts
 * @param {ScoringDegradationService} params.scoringDegradationService
 *
 * @returns {CoreScoring}
 */
function _scoreCoreCertification({
  event,
  assessmentSheet,
  algorithm,
  v3CertificationScoring,
  allChallenges,
  askedChallengesWithoutLiveAlerts,
  scoringDegradationService,
}) {
  const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
    abortReason: assessmentSheet.abortReason,
    algorithm,
    // The following spread operation prevents the original array to be mutated during the simulation
    // so that in can be used during the assessment result creation
    allAnswers: [...assessmentSheet.answers],
    allChallenges,
    challenges: askedChallengesWithoutLiveAlerts,
    maxReachableLevelOnCertificationDate: assessmentSheet.maxReachableLevelOnCertificationDate,
    v3CertificationScoring,
    scoringDegradationService,
  });

  const toBeCancelled = event instanceof CertificationCancelled;
  const assessmentResult = createV3AssessmentResult({
    toBeCancelled,
    allAnswers: assessmentSheet.answers,
    assessmentId: assessmentSheet.assessmentId,
    certificationAssessmentScore,
    isRejectedForFraud: assessmentSheet.isRejectedForFraud,
    isAbortReasonTechnical: assessmentSheet.isAbortReasonTechnical,
    juryId: event?.juryId,
  });

  return new CoreScoring(certificationAssessmentScore, assessmentResult);
}

/**
 * @param {object} params
 * @param {AssessmentSheet} params.assessmentSheet
 * @param {AssessmentResult} params.assessmentResult
 * @param {ComplementaryCertificationScoringCriteria} params.cleaScoringCriteria
 *
 * @returns {DoubleCertificationScoring}
 */
export function _scoreDoubleCertification({ assessmentSheet, assessmentResult, cleaScoringCriteria }) {
  return new DoubleCertificationScoring({
    complementaryCertificationCourseId: cleaScoringCriteria.complementaryCertificationCourseId,
    complementaryCertificationBadgeId: cleaScoringCriteria.complementaryCertificationBadgeId,
    reproducibilityRate: assessmentResult.reproducibilityRate,
    pixScore: assessmentResult.pixScore,
    minimumEarnedPix: cleaScoringCriteria.complementaryCertificationBadgeId,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
    minimumReproducibilityRate: cleaScoringCriteria.minimumReproducibilityRate,
    isRejectedForFraud: assessmentSheet.isRejectedForFraud,
  });
}
