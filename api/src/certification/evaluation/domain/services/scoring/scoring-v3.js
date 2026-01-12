/**
 * @typedef {import('../../models/Candidate.js')} Candidate
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../models/AssessmentSheet.js')} AssessmentSheet
 * @typedef {import('../index.js').SharedVersionRepository} SharedVersionRepository
 * @typedef {import('../index.js').ScoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {import('../index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../index.js').FlashAlgorithmService} FlashAlgorithmService
 * @typedef {import('../index.js').ScoreDoubleCertificationV3} ScoreDoubleCertificationV3
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 * @typedef {import('../index.js').CertificationAssessmentHistoryRepository} CertificationAssessmentHistoryRepository
 */

import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { config } from '../../../../../shared/config.js';
import { withTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { FlashAssessmentAlgorithm } from '../../../../evaluation/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../../scoring/domain/models/CertificationAssessmentHistory.js';
import { CertificationAssessmentScoreV3 } from '../../../../scoring/domain/models/CertificationAssessmentScoreV3.js';
import { AssessmentResultFactory } from '../../../../scoring/domain/models/factories/AssessmentResultFactory.js';
import { CompetenceMark } from '../../../../shared/domain/models/CompetenceMark.js';
import { createV3AssessmentResult } from './create-v3-assessment-result.js';

export const handleV3CertificationScoring = withTransaction(
  /**
   * @param {object} params
   * @param {object} params.event
   * @param {string} params.locale
   * @param {Candidate} params.candidate
   * @param {AssessmentSheet} params.assessmentSheet
   * @param {Array<CalibratedChallenge>} params.allChallenges
   * @param {Array<CalibratedChallenge>} params.askedChallengesWithoutLiveAlerts
   * @param {Array<CalibratedChallenge>} params.challengeCalibrationsWithoutLiveAlerts
   * @param {FlashAlgorithmService} params.flashAlgorithmService
   * @param {ScoringDegradationService} params.scoringDegradationService
   * @param {ScoreDoubleCertificationV3} params.scoreDoubleCertificationV3
   * @param {CertificationAssessmentHistoryRepository} params.certificationAssessmentHistoryRepository
   * @param {AssessmentResultRepository} params.assessmentResultRepository
   * @param {CompetenceMarkRepository} params.competenceMarkRepository
   * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
   * @param {SharedVersionRepository} params.sharedVersionRepository
   *
   * @return {boolean}
   */
  async ({
    event,
    locale,
    candidate,
    assessmentSheet,
    allChallenges,
    askedChallengesWithoutLiveAlerts,
    challengeCalibrationsWithoutLiveAlerts,
    flashAlgorithmService,
    scoringDegradationService,
    scoreDoubleCertificationV3,
    sharedVersionRepository,
    certificationAssessmentHistoryRepository,
    scoringConfigurationRepository,
    assessmentResultRepository,
    competenceMarkRepository,
  }) => {
    if (candidate.hasPixPlusSubscription) {
      return false;
    }

    if (candidate.hasOnlyCoreSubscription) {
      await _tmpCoreScoring({
        event,
        locale,
        candidate,
        assessmentSheet,
        allChallenges,
        askedChallengesWithoutLiveAlerts,
        challengeCalibrationsWithoutLiveAlerts,
        flashAlgorithmService,
        scoringDegradationService,
        sharedVersionRepository,
        certificationAssessmentHistoryRepository,
        scoringConfigurationRepository,
        assessmentResultRepository,
        competenceMarkRepository,
      });
      return true;
    }

    if (candidate.hasCleaSubscription) {
      await _tmpCoreScoring({
        event,
        locale,
        candidate,
        assessmentSheet,
        allChallenges,
        askedChallengesWithoutLiveAlerts,
        challengeCalibrationsWithoutLiveAlerts,
        flashAlgorithmService,
        scoringDegradationService,
        sharedVersionRepository,
        certificationAssessmentHistoryRepository,
        scoringConfigurationRepository,
        assessmentResultRepository,
        competenceMarkRepository,
      });

      scoreDoubleCertificationV3({ certificationCourseId: assessmentSheet.certificationCourseId });
      return true;
    }
  },
);

/**
 * @param {object} params
 * @param {AssessmentResult} params.assessmentResult
 * @param {number} params.certificationCourseId
 * @param {CertificationAssessmentScoreV3} params.certificationAssessmentScore
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 */
async function _saveV3Result({
  assessmentResult,
  certificationCourseId,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const newAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  for (const competenceMark of certificationAssessmentScore.competenceMarks) {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      assessmentResultId: newAssessmentResult.id,
    });
    await competenceMarkRepository.save(competenceMarkDomain);
  }
}

async function _tmpCoreScoring({
  event,
  locale,
  candidate,
  assessmentSheet,
  allChallenges,
  askedChallengesWithoutLiveAlerts,
  challengeCalibrationsWithoutLiveAlerts,
  flashAlgorithmService,
  scoringDegradationService,
  sharedVersionRepository,
  certificationAssessmentHistoryRepository,
  scoringConfigurationRepository,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const version = await sharedVersionRepository.getByScopeAndReconciliationDate({
    scope: candidate.subscriptionScope,
    reconciliationDate: candidate.reconciledAt,
  });
  // todo refacto calibrated-challenge-service to take assessmentSheet
  const certificationCourse = {
    getId: () => assessmentSheet.certificationCourseId,
    getAssessment: () => ({ id: assessmentSheet.assessmentId }),
  };

  const algorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: version.challengesConfiguration,
  });

  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByVersionAndLocale({
    locale,
    version,
  });

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

  // TODO extract to caller usecase
  const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
    algorithm,
    challenges: challengeCalibrationsWithoutLiveAlerts,
    allAnswers: assessmentSheet.answers,
  });
  await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

  // TODO extract to caller usecase
  await _saveV3Result({
    assessmentResult,
    certificationCourseId: assessmentSheet.certificationCourseId,
    certificationAssessmentScore,
    assessmentResultRepository,
    competenceMarkRepository,
  });
}
