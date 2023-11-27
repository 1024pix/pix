import { AssessmentResult } from '../models/AssessmentResult.js';
import { CertificationScoringCompleted } from './CertificationScoringCompleted.js';
import { CompetenceMark } from '../models/CompetenceMark.js';
import bluebird from 'bluebird';
import { CertificationComputeError } from '../errors.js';
import { AssessmentCompleted } from './AssessmentCompleted.js';
import { checkEventTypes } from './check-event-types.js';
import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationAssessmentScoreV3 } from '../models/CertificationAssessmentScoreV3.js';
import { ABORT_REASONS } from '../models/CertificationCourse.js';
import { FlashAssessmentAlgorithm } from '../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithm.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmConfiguration.js';

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
  flashAlgorithmConfigurationRepository,
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
        flashAlgorithmConfigurationRepository,
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
    const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);
    await _saveResult({
      certificationAssessmentScore,
      certificationAssessment,
      assessmentResultRepository,
      certificationCourse,
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
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  locale,
}) {
  const allAnswers = await answerRepository.findByAssessment(assessmentId);
  const challengeIds = allAnswers.map(({ challengeId }) => challengeId);
  const challenges = await challengeRepository.getMany(challengeIds, locale);

  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);

  const abortReason = certificationCourse.isAbortReasonCandidateRelated()
    ? ABORT_REASONS.CANDIDATE
    : ABORT_REASONS.TECHNICAL;

  const configuration =
    (await flashAlgorithmConfigurationRepository.get()) ?? new FlashAssessmentAlgorithmConfiguration();

  const algorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration,
  });

  const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
    algorithm,
    challenges,
    allAnswers,
    abortReason,
  });

  await _saveResult({
    certificationAssessment,
    certificationAssessmentScore,
    assessmentResultRepository,
    certificationCourse,
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
  certificationCourse,
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
  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update(certificationCourse);
}

handleCertificationScoring.eventTypes = eventTypes;
export { handleCertificationScoring };
