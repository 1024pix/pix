const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted.js');
const bluebird = require('bluebird');
const {
  CertificationComputeError,
} = require('../errors');
const CertificationAutoCancelCheckDone = require('./CertificationAutoCancelCheckDone');
const { checkEventTypes } = require('./check-event-types');

const eventTypes = [CertificationAutoCancelCheckDone];
const EMITTER = 'PIX-ALGO-NEUTRALIZATION';

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId: event.certificationCourseId });
  return await _calculateCertificationScore({
    certificationAssessment,
    assessmentResultRepository,
    competenceMarkRepository,
    scoringCertificationService,
    juryId: event.juryId,
    commentForJury: event.commentForJury,
  });
}

async function _calculateCertificationScore({
  certificationAssessment,
  assessmentResultRepository,
  competenceMarkRepository,
  scoringCertificationService,
  juryId,
  commentForJury,
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
      competenceMarkRepository,
      juryId,
      commentForJury,
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
      juryId,
      commentForJury,
    });
  }
}

async function _saveResult({
  certificationAssessment,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
  juryId,
  commentForJury,
}) {
  const assessmentResult = await _createAssessmentResult({
    certificationAssessment,
    certificationAssessmentScore,
    assessmentResultRepository,
    juryId,
    commentForJury,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId: assessmentResult.id });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

function _createAssessmentResult({ certificationAssessment, certificationAssessmentScore, assessmentResultRepository, juryId, commentForJury }) {
  const assessmentResult = AssessmentResult.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: EMITTER,
    juryId,
    commentForJury,
  });
  return assessmentResultRepository.save(assessmentResult);
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationComputeError,
  juryId,
  commentForJury,
}) {
  const assessmentResult = AssessmentResult.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    juryId,
    emitter: EMITTER,
    commentForJury,
  });
  await assessmentResultRepository.save(assessmentResult);
}

handleCertificationRescoring.eventTypes = eventTypes;
module.exports = handleCertificationRescoring;
