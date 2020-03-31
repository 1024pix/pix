const AssessmentResult = require('../models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');
const Promise = require('bluebird');
const { UNCERTIFIED_LEVEL } = require('../constants');
const {
  CertificationComputeError,
} = require('../errors');

const handleCertificationScoring = async function({
  assessmentCompletedEvent,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  assessmentRepository
}) {
  if (assessmentCompletedEvent.isCertification) {
    await _calculateCertificationScore({ assessmentId:assessmentCompletedEvent.assessmentId, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService, assessmentRepository });
  }
};

async function _calculateCertificationScore({
  assessmentId,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  assessmentRepository
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  try {
    const assessmentScore = await scoringCertificationService.calculateAssessmentScore(assessment);
    await _saveResult({
      assessment,
      assessmentScore,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
    });
  }
  catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      assessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _saveResult({
  assessment,
  assessmentScore,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository });

  await Promise.map(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain);
  });

  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date());
}

function _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository }) {
  const assessmentStatus = _getAssessmentStatus(assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, assessmentStatus, assessment.id);
  return assessmentResultRepository.save(assessmentResult);
}

function _getAssessmentStatus(assessmentScore) {
  if (assessmentScore.nbPix === 0) {
    assessmentScore.level = UNCERTIFIED_LEVEL;
    return AssessmentResult.status.REJECTED;
  } else {
    return AssessmentResult.status.VALIDATED;
  }
}

async function _saveResultAfterCertificationComputeError({
  assessment,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(certificationComputeError, assessment.id);
  await assessmentResultRepository.save(assessmentResult);
  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date());
}

module.exports = handleCertificationScoring;
