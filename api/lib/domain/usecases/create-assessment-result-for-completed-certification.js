const _ = require('lodash');
const moment = require('moment');

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');

const { AlreadyRatedAssessmentError,
  CertificationComputeError,
  NotFoundError } = require('../errors');

const CERTIFICATION_MAX_LEVEL = 5;
const CERTIFICATION_VALIDATED = 'validated';
const CERTIFICATION_REJECTED = 'rejected';
const NOT_VALIDATED_CERTIF_LEVEL = -1;

function _getAssessmentResultEvaluations(marks, assessmentType) {
  const pixScore = _.sumBy(marks, 'score');
  let level = Math.floor(pixScore / 8);

  if (pixScore === 0 && assessmentType === Assessment.types.CERTIFICATION) {
    const status = CERTIFICATION_REJECTED;
    level = NOT_VALIDATED_CERTIF_LEVEL;
    return { pixScore, level, status };
  } else {
    const status = CERTIFICATION_VALIDATED;
    return { pixScore, level, status };
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
    .then(() => {
      if (assessment.isCertificationAssessment()) {
        return certificationCourseRepository.changeCompletionDate(
          assessment.courseId,
          moment().toISOString(),
        );
      }
    });
}


function _setAssessmentResultIdOnMark(mark, assessmentResultId){
  mark.assessmentResultId = assessmentResultId;
  return mark;
}

function _limitMarkLevel(mark, assessment){
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

function _saveCertificationResult({
  assessment,
  assessmentId,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  mark,
  skills,
  skillsService,
}) {
  const { pixScore, level, status } = _getAssessmentResultEvaluations(mark, assessment.type);
  const assessmentResult = new AssessmentResult({
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    level: level,
    pixScore: pixScore,
    status,
    assessmentId,
  });
  assessment.setCompleted();

  return Promise.all([
    assessmentResultRepository.save(assessmentResult),
    mark,
    skillsService.saveAssessmentSkills(skills),
    assessmentRepository.save(assessment),
  ])
    .then(([assessmentResult, marks]) => {
      const assessmentResultId = assessmentResult.id;

      const saveMarksPromises = marks
        .map((mark) => _setAssessmentResultIdOnMark(mark, assessmentResultId))
        .map((mark) => _limitMarkLevel(mark, assessment))
        .map(competenceMarkRepository.save);

      return Promise.all(saveMarksPromises);
    })
    .then(() => {
      if (assessment.isCertificationAssessment()) {
        return certificationCourseRepository.changeCompletionDate(
          assessment.courseId,
          moment().toISOString()
        );
      }
    });
}

module.exports = function({
  assessmentId,
  forceRecomputeResult = false,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
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

      return Promise.all([
        assessmentService.getSkills(assessment),
        assessmentService.getCompetenceMarks(assessment),
      ]);
    })
    .then(([skills, mark]) => _saveCertificationResult({
      assessment,
      assessmentId,
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      mark,
      skills,
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

