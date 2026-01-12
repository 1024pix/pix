/**
 * @typedef {import('../../models/Candidate.js')} Candidate
 * @typedef {import('../../models/FlashAssessmentAlgorithm.js')} FlashAssessmentAlgorithm
 * @typedef {import('../../../../shared/domain/models/V3CertificationScoring.js')} V3CertificationScoring
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../models/AssessmentSheet.js')} AssessmentSheet
 * @typedef {import('../index.js').ScoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {import('../index.js').ScoreDoubleCertificationV3} ScoreDoubleCertificationV3
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 * @typedef {import('../index.js').ComplementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {import('../index.js').ComplementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 */

import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { withTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { CertificationAssessmentScoreV3 } from '../../../../scoring/domain/models/CertificationAssessmentScoreV3.js';
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
   * @param {ScoringDegradationService} params.scoringDegradationService
   * @param {ScoreDoubleCertificationV3} params.scoreDoubleCertificationV3
   * @param {ComplementaryCertificationScoringCriteriaRepository} params.complementaryCertificationScoringCriteriaRepository
   * @param {ComplementaryCertificationCourseResultRepository} params.complementaryCertificationCourseResultRepository
   *
   * @return {boolean} //TODO update
   */
  async ({
    event,
    candidate,
    assessmentSheet,
    allChallenges,
    askedChallengesWithoutLiveAlerts,
    algorithm,
    v3CertificationScoring,
    scoringDegradationService,
    scoreDoubleCertificationV3,
    complementaryCertificationScoringCriteriaRepository,
    complementaryCertificationCourseResultRepository,
  }) => {
    if (candidate.hasPixPlusSubscription) {
      return false;
    }

    if (candidate.hasOnlyCoreSubscription) {
      const coreScoring = await _tmpCoreScoring({
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
      const coreScoring = await _tmpCoreScoring({
        event,
        assessmentSheet,
        algorithm,
        v3CertificationScoring,
        allChallenges,
        askedChallengesWithoutLiveAlerts,
        scoringDegradationService,
      });

      const doubleCertificationScoring = scoreDoubleCertificationV3({
        assessmentSheet,
        assessmentResult: coreScoring.assessmentResult,
        complementaryCertificationScoringCriteriaRepository,
        complementaryCertificationCourseResultRepository,
      });
      return { coreScoring, doubleCertificationScoring };
    }
  },
);

//add jsdoc and rename

async function _tmpCoreScoring({
  event,
  assessmentSheet,
  algorithm,
  v3CertificationScoring,
  allChallenges,
  askedChallengesWithoutLiveAlerts,
  scoringDegradationService,
}) {
  // TODO return this CertificationAssessmentScore
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

  // TODO extract to caller usecase
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

  return { certificationAssessmentScore, assessmentResult };
}

export const scoreDoubleCertificationV3 = withTransaction(
  /**
   * @param {object} params
   * @param {AssessmentSheet} params.assessmentSheet
   * @param {AssessmentResult} params.assessmentResult
   * @param {ComplementaryCertificationScoringCriteriaRepository} params.complementaryCertificationScoringCriteriaRepository
   */
  async ({ assessmentSheet, assessmentResult, complementaryCertificationScoringCriteriaRepository }) => {
    //might be a parameter
    const scoringCriterias = await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({
      certificationCourseId: assessmentSheet.certificationCourseId,
    });

    const {
      minimumReproducibilityRate,
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      minimumEarnedPix,
    } = scoringCriterias[0];

    return new DoubleCertificationScoring({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      reproducibilityRate: assessmentResult.reproducibilityRate,
      pixScore: assessmentResult.pixScore,
      minimumEarnedPix,
      hasAcquiredPixCertification: assessmentResult.isValidated(),
      minimumReproducibilityRate,
      isRejectedForFraud: assessmentSheet.isRejectedForFraud,
    });
  },
);
