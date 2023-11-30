import { AssessmentResult } from '../models/AssessmentResult.js';
import { CertificationResult } from '../models/CertificationResult.js';
import { CompetenceMark } from '../models/CompetenceMark.js';
import { CertificationRescoringCompleted } from './CertificationRescoringCompleted.js';
import bluebird from 'bluebird';
import { CertificationComputeError } from '../errors.js';
import { ChallengeNeutralized } from './ChallengeNeutralized.js';
import { ChallengeDeneutralized } from './ChallengeDeneutralized.js';
import { CertificationJuryDone } from './CertificationJuryDone.js';
import { checkEventTypes } from './check-event-types.js';
import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationAssessmentScoreV3 } from '../models/CertificationAssessmentScoreV3.js';
import { ABORT_REASONS } from '../models/CertificationCourse.js';
import { FlashAssessmentAlgorithm } from '../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithm.js';
import { config } from '../../../src/shared/config.js';

const eventTypes = [ChallengeNeutralized, ChallengeDeneutralized, CertificationJuryDone];
const EMITTER = 'PIX-ALGO';

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  competenceMarkRepository,
  scoringCertificationService,
  certificationCourseRepository,
  challengeRepository,
  answerRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: event.certificationCourseId,
  });

  try {
    if (certificationAssessment.version === CertificationVersion.V3) {
      return _handleV3Certification({
        challengeRepository,
        answerRepository,
        certificationAssessment,
        assessmentResultRepository,
        certificationCourseRepository,
        flashAlgorithmConfigurationRepository,
        flashAlgorithmService,
      });
    }

    return await _handleV2Certification({
      scoringCertificationService,
      certificationAssessment,
      event,
      assessmentResultRepository,
      competenceMarkRepository,
      certificationCourseRepository,
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
      juryId: event.juryId,
      event,
    });
  }
}

async function _handleV3Certification({
  challengeRepository,
  answerRepository,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
}) {
  const allAnswers = await answerRepository.findByAssessment(certificationAssessment.id);
  const challengeIds = allAnswers.map(({ challengeId }) => challengeId);
  const challenges = await challengeRepository.getManyFlashParameters(challengeIds);

  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);

  const abortReason = certificationCourse.isAbortReasonCandidateRelated()
    ? ABORT_REASONS.CANDIDATE
    : ABORT_REASONS.TECHNICAL;

  const configuration = await flashAlgorithmConfigurationRepository.get();

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

  const assessmentResult = AssessmentResult.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
  });

  if (_shouldCancelV3Certification({ allAnswers, certificationCourse })) {
    const cancelMessage = 'Cancelled due to lack of answers and technical issues';
    assessmentResult.commentForCandidate = cancelMessage;
    assessmentResult.commentForOrganization = cancelMessage;
    certificationCourse.cancel();
    certificationCourseRepository.update(certificationCourse);
  }

  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });

  return new CertificationRescoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
  });
}

function _shouldCancelV3Certification({ allAnswers, certificationCourse }) {
  return (
    allAnswers.length < config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification &&
    !certificationCourse.isAbortReasonCandidateRelated()
  );
}

async function _handleV2Certification({
  scoringCertificationService,
  certificationAssessment,
  event,
  assessmentResultRepository,
  competenceMarkRepository,
  certificationCourseRepository,
}) {
  const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
    certificationAssessment,
    continueOnError: false,
  });

  const assessmentResultId = await _saveAssessmentResult(
    certificationAssessmentScore,
    certificationAssessment,
    event,
    assessmentResultRepository,
  );
  await _saveCompetenceMarks(certificationAssessmentScore, assessmentResultId, competenceMarkRepository);

  await _cancelCertificationCourseIfHasNotEnoughNonNeutralizedChallengesToBeTrusted({
    certificationCourseId: certificationAssessment.certificationCourseId,
    hasEnoughNonNeutralizedChallengesToBeTrusted:
      certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted,
    certificationCourseRepository,
  });

  return new CertificationRescoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
  });
}

async function _cancelCertificationCourseIfHasNotEnoughNonNeutralizedChallengesToBeTrusted({
  certificationCourseId,
  hasEnoughNonNeutralizedChallengesToBeTrusted,
  certificationCourseRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  if (hasEnoughNonNeutralizedChallengesToBeTrusted) {
    certificationCourse.uncancel();
  } else {
    certificationCourse.cancel();
  }

  return certificationCourseRepository.update(certificationCourse);
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationComputeError,
  juryId,
  event,
}) {
  const emitter = _getEmitterFromEvent(event);
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    juryId,
    emitter,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
}

async function _saveAssessmentResult(
  certificationAssessmentScore,
  certificationAssessment,
  event,
  assessmentResultRepository,
) {
  let assessmentResult;
  const emitter = _getEmitterFromEvent(event);
  if (!certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted) {
    assessmentResult = AssessmentResult.buildNotTrustableAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter,
      juryId: event.juryId,
    });
  } else {
    assessmentResult = AssessmentResult.buildStandardAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter,
      juryId: event.juryId,
    });
  }
  const { id: assessmentResultId } = await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  return assessmentResultId;
}

async function _saveCompetenceMarks(certificationAssessmentScore, assessmentResultId, competenceMarkRepository) {
  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

function _getEmitterFromEvent(event) {
  let emitter;

  if (event instanceof ChallengeNeutralized || event instanceof ChallengeDeneutralized) {
    emitter = CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION;
  }

  if (event instanceof CertificationJuryDone) {
    emitter = CertificationResult.emitters.PIX_ALGO_AUTO_JURY;
  }

  return emitter;
}

handleCertificationRescoring.eventTypes = eventTypes;
export { handleCertificationRescoring };
