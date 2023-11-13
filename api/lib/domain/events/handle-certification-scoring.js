import { AssessmentResult } from '../models/AssessmentResult.js';
import { CertificationScoringCompleted } from './CertificationScoringCompleted.js';
import { CompetenceMark } from '../models/CompetenceMark.js';
import bluebird from 'bluebird';
import { CertificationComputeError } from '../errors.js';
import { AssessmentCompleted } from './AssessmentCompleted.js';
import { checkEventTypes } from './check-event-types.js';
import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationAssessmentScoreV3 } from '../models/CertificationAssessmentScoreV3.js';

const eventTypes = [AssessmentCompleted];
const EMITTER = 'PIX-ALGO';

async function handleCertificationScoring({
  event,
  assessmentResultRepository,
  badgeAcquisitionRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  answerRepository,
  challengeRepository,
  flashAlgorithmService,
}) {
  checkEventTypes(event, eventTypes);

  if (event.isCertificationType) {
    const certificationAssessment = await certificationAssessmentRepository.get(event.assessmentId);

    if (certificationAssessment.version === CertificationVersion.V3) {
      return _handleV3CertificationScoring({
        challengeRepository,
        answerRepository,
        assessmentId: event.assessmentId,
        certificationAssessment,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        flashAlgorithmService,
        locale: event.locale,
      });
    }

    return _calculateCertificationScore({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      scoringCertificationService,
      badgeAcquisitionRepository,
    });
  }

  return null;
}

async function _calculateCertificationScore({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  try {
    const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
      certificationAssessment,
      continueOnError: false,
    });
    await _saveResult({
      certificationAssessmentScore,
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });
    return new CertificationScoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
    });
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _handleV3CertificationScoring({
  challengeRepository,
  answerRepository,
  assessmentId,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  flashAlgorithmService,
  locale,
}) {
  const allAnswers = await answerRepository.findByAssessment(assessmentId);
  const challengeIds = allAnswers.map(({ challengeId }) => challengeId);
  const challenges = await challengeRepository.getMany(challengeIds, locale);

  const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
    challenges,
    allAnswers,
    flashAlgorithmService,
  });

  await _saveResult({
    certificationAssessment,
    certificationAssessmentScore,
    assessmentResultRepository,
    certificationCourseRepository,
    competenceMarkRepository,
  });

  return new CertificationScoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
  });
}

async function _saveResult({
  certificationAssessment,
  certificationAssessmentScore,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({
    certificationAssessment,
    certificationAssessmentScore,
    assessmentResultRepository,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      ...{ assessmentResultId: assessmentResult.id },
    });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update(certificationCourse);
}

function _createAssessmentResult({
  certificationAssessment,
  certificationAssessmentScore,
  assessmentResultRepository,
}) {
  const assessmentResult = AssessmentResult.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
  });
  return assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update(certificationCourse);
}
handleCertificationScoring.eventTypes = eventTypes;
export { handleCertificationScoring };
