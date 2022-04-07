const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted.js');
const bluebird = require('bluebird');
const { CertificationComputeError } = require('../errors');
const ChallengeNeutralized = require('./ChallengeNeutralized');
const ChallengeDeneutralized = require('./ChallengeDeneutralized');
const CertificationJuryDone = require('./CertificationJuryDone');
const { checkEventTypes } = require('./check-event-types');

const eventTypes = [ChallengeNeutralized, ChallengeDeneutralized, CertificationJuryDone];
const EMITTER = 'PIX-ALGO-NEUTRALIZATION';

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  competenceMarkRepository,
  scoringCertificationService,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: event.certificationCourseId,
  });

  try {
    const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
      certificationAssessment,
      continueOnError: false,
    });

    const assessmentResultId = await _saveAssessmentResult(
      certificationAssessmentScore,
      certificationAssessment,
      event,
      assessmentResultRepository
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
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationComputeError: error,
      juryId: event.juryId,
    });
  }
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
}) {
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    juryId,
    emitter: EMITTER,
  });
  await assessmentResultRepository.save(assessmentResult);
}

async function _saveAssessmentResult(
  certificationAssessmentScore,
  certificationAssessment,
  event,
  assessmentResultRepository
) {
  let assessmentResult;
  if (!certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted) {
    assessmentResult = AssessmentResult.buildNotTrustableAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: EMITTER,
      juryId: event.juryId,
    });
  } else {
    assessmentResult = AssessmentResult.buildStandardAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: EMITTER,
      juryId: event.juryId,
    });
  }
  const { id: assessmentResultId } = await assessmentResultRepository.save(assessmentResult);
  return assessmentResultId;
}

async function _saveCompetenceMarks(certificationAssessmentScore, assessmentResultId, competenceMarkRepository) {
  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

handleCertificationRescoring.eventTypes = eventTypes;
module.exports = handleCertificationRescoring;
