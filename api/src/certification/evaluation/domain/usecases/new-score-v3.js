/** incomplete
 * @typedef {import('./index.js').Services} Services
 * @typedef {import('./index.js').AssessmentSheetRepository} AssessmentSheetRepository
 * @typedef {import('./index.js').SharedVersionRepository} SharedVersionRepository
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').ComplementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithm } from '../../../evaluation/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../scoring/domain/models/CertificationAssessmentHistory.js';
import { SessionAlreadyPublishedError } from '../../../session-management/domain/errors.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';

export const scoreV3Certification = withTransaction(
  /**
   * @param {object} params
   * @param {number} param.certificationCourseId
   * @param {string} params.locale
   * @param {Services} params.services
   * @param {AssessmentSheetRepository} params.assessmentSheetRepository
   * @param {CertificationCandidateRepository} params.certificationCandidateRepository
   * @param {SharedVersionRepository} params.sharedVersionRepository
   * @param {AssessmentResultRepository} params.assessmentResultRepository
   * @param {CompetenceMarkRepository} params.competenceMarkRepository
   * @param {CertificationAssessmentHistoryRepository} params.certificationAssessmentHistoryRepository
   * @param {CertificationCourseRepository} params.certificationCourseRepository
   * @param {ComplementaryCertificationCourseResultRepository} params.complementaryCertificationCourseResultRepository
   * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
   * @param {EvaluationSessionRepository} params.evaluationSessionRepository
   * @param {ComplementaryCertificationScoringCriteriaRepository} params.complementaryCertificationScoringCriteriaRepository
   */
  async ({
    certificationCourseId,
    locale,
    services,
    assessmentSheetRepository,
    certificationCandidateRepository,
    sharedVersionRepository,
    assessmentResultRepository,
    competenceMarkRepository,
    certificationAssessmentHistoryRepository,
    certificationCourseRepository,
    complementaryCertificationCourseResultRepository,
    scoringConfigurationRepository,
    evaluationSessionRepository,
    complementaryCertificationScoringCriteriaRepository,
  }) => {
    const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);

    const candidate = await certificationCandidateRepository.findByAssessmentId({
      assessmentId: assessmentSheet.assessmentId,
    });

    // version, allChallenges, askedChallengesWithoutLiveAlerts, algorithm and v3CertificationScoring could be its own "exam conditions" model
    const version = await sharedVersionRepository.getByScopeAndReconciliationDate({
      scope: candidate.subscriptionScope,
      reconciliationDate: candidate.reconciledAt,
    });

    const { allChallenges, askedChallengesWithoutLiveAlerts, challengeCalibrationsWithoutLiveAlerts } =
      await services.findByCertificationCourseAndVersion({
        certificationCourseId: assessmentSheet.certificationCourseId,
        assessmentId: assessmentSheet.assessmentId,
        version,
      });

    const algorithm = new FlashAssessmentAlgorithm({
      flashAlgorithmImplementation: services.flashAlgorithmService,
      configuration: version.challengesConfiguration,
    });

    const v3CertificationScoring = await scoringConfigurationRepository.getLatestByVersionAndLocale({
      locale,
      version,
    });

    const scoringCriteria = await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({
      certificationCourseId: assessmentSheet.certificationCourseId,
    })[0];

    if (
      _verifyCertificationIsScorable(
        assessmentSheet.certificationCourseId,
        assessmentSheet.answers,
        version.challengesConfiguration.maximumAssessmentLength,
        evaluationSessionRepository,
      )
    ) {
      // coreScoring could be a model like doubleCertificationScoring
      const { coreScoring, doubleCertificationScoring } = services.handleV3CertificationScoring({
        locale,
        candidate,
        assessmentSheet,
        allChallenges,
        askedChallengesWithoutLiveAlerts,
        algorithm,
        v3CertificationScoring,
        scoringCriteria,
      });

      const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
        algorithm,
        challenges: challengeCalibrationsWithoutLiveAlerts,
        allAnswers: assessmentSheet.answers,
      });
      await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

      await _saveV3Result({
        assessmentResult: coreScoring.assessmentResult,
        certificationCourseId: assessmentSheet.certificationCourseId,
        certificationAssessmentScore: coreScoring.certificationAssessmentScore,
        assessmentResultRepository,
        competenceMarkRepository,
        certificationCourseRepository,
      });

      if (doubleCertificationScoring) {
        await complementaryCertificationCourseResultRepository.save(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: doubleCertificationScoring.complementaryCertificationCourseId,
            complementaryCertificationBadgeId: doubleCertificationScoring.complementaryCertificationBadgeId,
            source: doubleCertificationScoring.source,
            acquired: doubleCertificationScoring.isAcquired(),
          }),
        );
      }
    }
    //else ?
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
  certificationCourseRepository,
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

  //Getting the certificationCourse just to add a completedAt date (that is possibly already set)
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  //Only if certificationCourse.completedAt (private) is null
  certificationCourse.complete({ now: new Date() });
  await certificationCourseRepository.update({ certificationCourse });
}

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {EvaluationSessionRepository} params.evaluationSessionRepository
 *
 * @returns {Promise<void>}
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
const _verifyCertificationIsScorable = async ({
  certificationCourseId,
  answers,
  maximumAssessmentLength,
  evaluationSessionRepository,
}) => {
  const session = await evaluationSessionRepository.getByCertificationCourseId({ certificationCourseId });

  if (session.isPublished) {
    throw new SessionAlreadyPublishedError();
  }

  const hasCandidateSeenEndScreen = answers.length == maximumAssessmentLength - 1;

  if (!session.isFinalized && !hasCandidateSeenEndScreen) {
    throw new NotFinalizedSessionError();
  }
  return true;
};
