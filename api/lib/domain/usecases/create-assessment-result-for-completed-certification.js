const moment = require('moment');

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');

const scoring = require('../strategies/scoring/scoring');

const {
  AlreadyRatedAssessmentError,
  CertificationComputeError,
  NotFoundError,
} = require('../errors');

const CERTIFICATION_MAX_LEVEL = 5;
const CERTIFICATION_VALIDATED = 'validated';
const CERTIFICATION_REJECTED = 'rejected';
const NOT_VALIDATED_CERTIF_LEVEL = -1;

module.exports = function createAssessmentResultForCompletedCertification({
  // Parameters
  assessmentId,
  forceRecomputeResult = false,
  // Repositories
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  // Services
  assessmentService,
  skillsService,
}) {
  let assessment;

  return assessmentRepository.get(assessmentId)
    .then((foundAssessment) => {

      assessment = foundAssessment;

      if (!assessment) {
        throw new NotFoundError();
      }

      if (assessment.isCompleted() && !forceRecomputeResult) {
        throw new AlreadyRatedAssessmentError();
      }

      return assessmentService.getSkillsReportAndCompetenceMarks(assessment);
    })
    .then(({ skills, competenceMarks }) => _saveCertificationResult({
      assessment,
      assessmentId,
      competenceMarks,
      skills,
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      skillsService,
    }))
    .catch((error) => _saveResultAfterComputingError({
      assessment,
      assessmentId,
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      error,
    }));
};

function _saveCertificationResult({
  // Parameters
  assessment,
  assessmentId,
  competenceMarks,
  skills,
  // Repositories
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  // Services
  skillsService,
}) {
  const { pixScore, level, status } = _getAssessmentResultEvaluations(competenceMarks, assessment.type);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(level, pixScore, status, assessmentId);
  assessment.setCompleted();

  return Promise.all([
    assessmentResultRepository.save(assessmentResult),
    competenceMarks,
    skillsService.saveAssessmentSkills(skills),
    assessmentRepository.save(assessment),
  ])
    .then(([assessmentResult, competenceMarks]) => {
      const assessmentResultId = assessmentResult.id;

      const saveMarksPromises = competenceMarks
        .map((mark) => _setAssessmentResultIdOnMark(mark, assessmentResultId))
        .map((mark) => _limitMarkLevel(mark, assessment))
        .map(competenceMarkRepository.save);

      return Promise.all(saveMarksPromises);
    })
    .then(() => _updateCompletedDateOfCertification(assessment, certificationCourseRepository));
}

function _getAssessmentResultEvaluations(competenceMarks, assessmentType) {
  const competencesPixScore = competenceMarks.map((competenceMark) => competenceMark.score);
  // for PLACEMENT, there is only one competence, so totalPixScore is the same as competence Pix score
  // for CERTIFICATION, we compute all competences score
  const totalPixScore = scoring.computeTotalPixScore(competencesPixScore);
  let level = scoring.computeLevel(totalPixScore);

  if (totalPixScore === 0 && assessmentType === Assessment.types.CERTIFICATION) {
    const status = CERTIFICATION_REJECTED;
    level = NOT_VALIDATED_CERTIF_LEVEL;
    return { pixScore: totalPixScore, level, status };
  } else {
    const status = CERTIFICATION_VALIDATED;
    return { pixScore: totalPixScore, level, status };
  }
}

function _setAssessmentResultIdOnMark(mark, assessmentResultId) {
  mark.assessmentResultId = assessmentResultId;
  return mark;
}

function _limitMarkLevel(mark, assessment) {
  /*
   * XXX une certification ne peut pas avoir une compétence en base au dessus de niveau 5;
   * par contre le reste de l'algorithme peut avoir des niveaux au dessus, et l'on ne plafonnera pas pour les
   * autres Assessments (par exemple Placements).
   */
  if (assessment.type === Assessment.types.CERTIFICATION) {
    mark.level = Math.min(mark.level, CERTIFICATION_MAX_LEVEL);
  }
  return mark;
}

function _updateCompletedDateOfCertification(assessment, certificationCourseRepository) {
  if (assessment.hasTypeCertification()) {
    return certificationCourseRepository.changeCompletionDate(
      assessment.courseId,
      moment().toISOString(),
    );
  } else {
    return Promise.resolve();
  }
}

function _saveResultAfterComputingError({
  assessment,
  assessmentId,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  error,
}) {
  if (!(error instanceof CertificationComputeError)) {
    return Promise.reject(error);
  }

  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(error, assessmentId);
  assessment.setCompleted();

  return Promise.all([
    assessmentResultRepository.save(assessmentResult),
    assessmentRepository.save(assessment),
  ])
    .then(() => _updateCompletedDateOfCertification(assessment, certificationCourseRepository));
}
