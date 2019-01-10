const moment = require('moment');

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');

const {
  AlreadyRatedAssessmentError,
  CertificationComputeError,
  NotFoundError,
} = require('../errors');

const COMPETENCE_MAX_LEVEL_FOR_CERTIFICATION = 5;
const NOT_VALIDATED_LEVEL = -1;

module.exports = function createAssessmentResultForCompletedAssessment({
  // Parameters
  assessmentId,
  forceRecomputeResult = false,
  // Repositories
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  challengeRepository,
  competenceRepository,
  competenceMarkRepository,
  courseRepository,
  skillRepository,
  // Services
  scoringService,
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

      const dependencies = { answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository };

      return scoringService.calculateAssessmentScore(dependencies, assessment);
    })
    .then((assessmentScore) => _saveAssessmentResult({
      assessment,
      assessmentScore,
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

function _saveAssessmentResult({
  // Parameters
  assessment,
  assessmentScore,
  // Repositories
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  // Services
  skillsService,
}) {
  const status = _getAssessmentStatus(assessment, assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, status, assessment.id);
  assessment.setCompleted();

  return Promise.all([
    assessmentResultRepository.save(assessmentResult),
    assessmentScore.competenceMarks,
    skillsService.saveAssessmentSkills(assessment.id, assessmentScore.validatedSkills, assessmentScore.failedSkills),
    assessmentRepository.save(assessment),
  ])
    .then(([assessmentResult, competenceMarks]) => {
      const assessmentResultId = assessmentResult.id;

      const saveMarksPromises = competenceMarks
        .map((mark) => _setAssessmentResultIdOnMark(mark, assessmentResultId))
        .map((mark) => _ceilCompetenceMarkLevelForCertification(mark, assessment))
        .map(competenceMarkRepository.save);

      return Promise.all(saveMarksPromises);
    })
    .then(() => _updateCompletedDateOfCertification(assessment, certificationCourseRepository));
}

function _getAssessmentStatus(assessment, assessmentScore) {
  if (assessmentScore.nbPix === 0 && assessment.isCertification()) {
    assessmentScore.level = NOT_VALIDATED_LEVEL;
    return AssessmentResult.status.REJECTED;
  } else {
    return AssessmentResult.status.VALIDATED;
  }
}

function _setAssessmentResultIdOnMark(mark, assessmentResultId) {
  mark.assessmentResultId = assessmentResultId;
  return mark;
}

function _ceilCompetenceMarkLevelForCertification(mark, assessment) {
  /*
   * XXX une certification ne peut pas avoir une compétence en base au dessus de niveau 5;
   * par contre le reste de l'algorithme peut avoir des niveaux au-dessus, et l'on ne plafonnera pas pour les
   * autres Assessments (par exemple Placements).
   */
  if (assessment.type === Assessment.types.CERTIFICATION) {
    mark.level = Math.min(mark.level, COMPETENCE_MAX_LEVEL_FOR_CERTIFICATION);
  }
  return mark;
}

function _updateCompletedDateOfCertification(assessment, certificationCourseRepository) {
  if (assessment.isCertification()) {
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
