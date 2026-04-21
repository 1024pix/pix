/**
 * @typedef {import('./index.js').Services} Services
 * @typedef {import('./index.js').AssessmentSheetRepository} AssessmentSheetRepository
 * @typedef {import('./index.js').VersionApi} VersionApi
 * @typedef {import('./index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('./index.js').sharedCompetenceMarkRepository} SharedCompetenceMarkRepository
 * @typedef {import('./index.js').CertificationAssessmentHistoryRepository} CertificationAssessmentHistoryRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').ComplementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {import('./index.js').ScoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').ComplementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFinalizedSessionError, NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionAlreadyPublishedError } from '../../../session-management/domain/errors.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { CertificationAssessmentHistory } from '../models/CertificationAssessmentHistory.js';
import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {Object} params.event
 * @param {Services} params.services
 * @param {AssessmentSheetRepository} params.assessmentSheetRepository
 * @param {VersionApi} params.versionApi
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {SharedCompetenceMarkRepository} params.sharedCompetenceMarkRepository
 * @param {CertificationAssessmentHistoryRepository} params.certificationAssessmentHistoryRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {ComplementaryCertificationCourseResultRepository} params.complementaryCertificationCourseResultRepository
 * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {ComplementaryCertificationScoringCriteriaRepository} params.complementaryCertificationScoringCriteriaRepository
 */
export async function scoreV3Certification({
  event,
  certificationCourseId,
  services,
  assessmentSheetRepository,
  versionApi,
  assessmentResultRepository,
  sharedCompetenceMarkRepository,
  certificationAssessmentHistoryRepository,
  certificationCourseRepository,
  complementaryCertificationCourseResultRepository,
  scoringConfigurationRepository,
  sessionRepository,
  complementaryCertificationScoringCriteriaRepository,
}) {
  const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);
  if (!assessmentSheet)
    throw new NotFoundError('No AssessmentSheet found for certificationCourseId ' + certificationCourseId);

  const version = await versionApi.getById({ id: assessmentSheet.versionId });

  await _verifyCertificationIsScorable({
    certificationCourseId: assessmentSheet.certificationCourseId,
    answers: assessmentSheet.answers,
    maximumAssessmentLength: version.challengesConfiguration.maximumAssessmentLength,
    sessionRepository,
  });

  const { allChallenges, askedChallengesWithoutLiveAlerts, challengeCalibrationsWithoutLiveAlerts } =
    await services.findCalibratedChallenges({
      certificationCourseId: assessmentSheet.certificationCourseId,
      assessmentId: assessmentSheet.assessmentId,
      version,
    });

  const algorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: services.flashAlgorithmService,
    configuration: version.challengesConfiguration,
  });

  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByVersion({
    version,
  });

  const [cleaScoringCriteria] = await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({
    certificationCourseId: assessmentSheet.certificationCourseId,
  });

  const { coreAssessmentResult, doubleCertificationScoring } = services.handleV3CertificationScoring({
    event,
    assessmentSheet,
    allChallenges,
    askedChallengesWithoutLiveAlerts,
    algorithm,
    v3CertificationScoring,
    cleaScoringCriteria,
  });

  const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
    algorithm,
    challenges: challengeCalibrationsWithoutLiveAlerts,
    allAnswers: assessmentSheet.answers,
  });

  // We reduce the coverage of the transaction since, before that point, only reads are done
  await DomainTransaction.execute(async () => {
    await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

    if (coreAssessmentResult) {
      await _saveV3Result({
        assessmentResult: coreAssessmentResult,
        certificationCourseId: assessmentSheet.certificationCourseId,
        assessmentResultRepository,
        sharedCompetenceMarkRepository,
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
  });
}

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {SessionRepository} params.sessionRepository
 *
 * @returns {Promise<void>}
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
const _verifyCertificationIsScorable = async ({
  certificationCourseId,
  answers,
  maximumAssessmentLength,
  sessionRepository,
}) => {
  const session = await sessionRepository.getByCertificationCourseId({ certificationCourseId });

  if (session.isPublished) {
    throw new SessionAlreadyPublishedError();
  }

  const hasCandidateSeenEndScreen = answers.length === maximumAssessmentLength;

  if (!session.isFinalized && !hasCandidateSeenEndScreen) {
    throw new NotFinalizedSessionError();
  }
};

/**
 * @param {object} params
 * @param {AssessmentResult} params.assessmentResult
 * @param {number} params.certificationCourseId
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {SharedCompetenceMarkRepository} params.sharedCompetenceMarkRepository
 */
async function _saveV3Result({
  assessmentResult,
  certificationCourseId,
  assessmentResultRepository,
  sharedCompetenceMarkRepository,
}) {
  const newAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  const competenceMarksToSave = assessmentResult.competenceMarks.map(
    (competenceMark) => new CompetenceMark({ ...competenceMark, assessmentResultId: newAssessmentResult.id }),
  );

  await sharedCompetenceMarkRepository.saveMany({
    competenceMarks: competenceMarksToSave,
  });
}
