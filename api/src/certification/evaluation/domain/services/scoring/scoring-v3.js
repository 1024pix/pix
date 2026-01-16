/**
 * @typedef {import('../../models/Candidate.js')} Candidate
 * @typedef {import('../../models/FlashAssessmentAlgorithm.js')} FlashAssessmentAlgorithm
 * @typedef {import('../../../../shared/domain/models/V3CertificationScoring.js')} V3CertificationScoring
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../models/AssessmentSheet.js')} AssessmentSheet
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 */

import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { withTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { CertificationAssessmentScoreV3 } from '../../../../scoring/domain/models/CertificationAssessmentScoreV3.js';
import { CoreScoring } from '../../models/CoreScoring.js';
import { DoubleCertificationScoring } from '../../models/DoubleCertificationScoring.js';
import { createV3AssessmentResult } from './create-v3-assessment-result.js';

export const handleV3CertificationScoring = withTransaction(
  /**
   * @param {object} params
   * @param {object} params.event
   * @param {Candidate} params.candidate
   * @param {AssessmentSheet} params.assessmentSheet
   * @param {FlashAssessmentAlgorithm} params.algorithm
   * @param {V3CertificationScoring} params.v3CertificationScoring
   * @param {Array<CalibratedChallenge>} params.allChallenges
   * @param {Array<CalibratedChallenge>} params.askedChallengesWithoutLiveAlerts
   * @param {ComplementaryCertificationScoringCriteria} params.scoringCriteria
   * @param {ScoringDegradationService} params.scoringDegradationService
   *
   * @return {undefined | CoreScoring | Object<CoreScoring, DoubleCertificationScoring>}
   */
  async ({
    event,
    candidate,
    assessmentSheet,
    allChallenges,
    askedChallengesWithoutLiveAlerts,
    algorithm,
    v3CertificationScoring,
    scoringCriteria,
    scoringDegradationService,
  }) => {
    if (candidate.hasPixPlusSubscription) {
      return;
    }

    if (candidate.hasOnlyCoreSubscription) {
      const coreScoring = await _scoreCoreCertification({
        event,
        assessmentSheet,
        algorithm,
        v3CertificationScoring,
        allChallenges,
        askedChallengesWithoutLiveAlerts,
        scoringDegradationService,
      });
      return coreScoring;
    }

    if (candidate.hasCleaSubscription) {
      const coreScoring = await _scoreCoreCertification({
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
        scoringCriteria,
      });
      return { coreScoring, doubleCertificationScoring };
    }
  },
);

/**
 * @param {object} params
 * @param {object} params.event
 * @param {AssessmentSheet} params.assessmentSheet
 * @param {FlashAssessmentAlgorithm} params.algorithm
 * @param {V3CertificationScoring} params.v3CertificationScoring
 * @param {Array<CalibratedChallenge>} params.allChallenges
 * @param {Array<CalibratedChallenge>} params.askedChallengesWithoutLiveAlerts
 * @param {ScoringDegradationService} params.scoringDegradationService
 *
 * @returns {CoreScoring}
 */
async function _scoreCoreCertification({
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
 * @param {ComplementaryCertificationScoringCriteria} params.scoringCriteria
 *
 * @returns {DoubleCertificationScoring}
 */
export function _scoreDoubleCertification({ assessmentSheet, assessmentResult, scoringCriteria }) {
  return new DoubleCertificationScoring({
    complementaryCertificationCourseId: scoringCriteria.complementaryCertificationCourseId,
    complementaryCertificationBadgeId: scoringCriteria.complementaryCertificationBadgeId,
    reproducibilityRate: assessmentResult.reproducibilityRate,
    pixScore: assessmentResult.pixScore,
    minimumEarnedPix: scoringCriteria.complementaryCertificationBadgeId,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
    minimumReproducibilityRate: scoringCriteria.complementaryCertificationBadgeId,
    isRejectedForFraud: assessmentSheet.isRejectedForFraud,
  });
}
