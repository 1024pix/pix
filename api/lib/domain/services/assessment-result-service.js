const moment = require('moment');

const AssessmentResult = require('../../domain/models/AssessmentResult');
const Assessment = require('../../domain/models/Assessment');

const skillService = require('../../domain/services/skills-service');
const assessmentService = require('../../domain/services/assessment-service');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

const { NotFoundError, AlreadyRatedAssessmentError, CertificationComputeError } = require('../../domain/errors');

const CERTIFICATION_MAX_LEVEL = 5;

// TODO: Should compute pixScore automatically in AssessmentResult + create an Utils to compute level/status everywhere
function _getAssessmentResultEvaluations(marks, assessmentType) {

  const pixScore = marks.reduce((totalPixScore, mark) => {
    return totalPixScore + mark.score;
  }, 0);
  let level = Math.floor(pixScore / 8);
  let status = 'validated';
  if (pixScore === 0 && assessmentType === Assessment.types.CERTIFICATION) {
    status = 'rejected';
    level = -1;
  }
  return { pixScore, level, status };
}

function _validatedDataForAllCompetenceMark(marks) {
  return Promise.all(marks.map((mark) => mark.validate()));
}

function _saveResultAfterComputingError(error, assessment, assessmentId) {
  if(error instanceof CertificationComputeError) {
    const assessmentResult = new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: error.message,
      level: 0,
      pixScore: 0,
      status: 'error',
      assessmentId,
    });
    assessment.setCompleted();

    return Promise.all([
      assessmentResultRepository.save(assessmentResult),
      assessmentRepository.save(assessment),
    ]).then(() => {
      if (assessmentService.isCertificationAssessment(assessment)) {
        return certificationCourseRepository.changeCompletionDate(assessment.courseId,
          moment().toISOString());
      }
    });
  } else {
    return Promise.reject(error);
  }
}

function _saveCertificationResult(assessment, assessmentId, skills, mark) {
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
    skillService.saveAssessmentSkills(skills),
    assessmentRepository.save(assessment),
  ])
    .then(([assessmentResult, marks]) => {
      const assessmentResultId = assessmentResult.id;

      const saveMarksPromises = marks.map((mark) => {
        mark.assessmentResultId = assessmentResultId;
        return mark;
      }).map((mark) => {
        /*
         * XXX une certification ne peut pas avoir une compétence en base au dessus de niveau 5;
         * par contre le reste de l'algorithme peut avoir des niveaux au dessus, et l'on ne plafonnera pas pour les
         * autres Assessments (par exemple Placements).
         */
        if (assessment.type === Assessment.types.CERTIFICATION) {
          mark.level = Math.min(mark.level, CERTIFICATION_MAX_LEVEL);
        }
        return mark;
      }).map((mark) => competenceMarkRepository.save(mark));

      return Promise.all(saveMarksPromises);
    })
    .then(() => {
      if (assessmentService.isCertificationAssessment(assessment)) {
        return certificationCourseRepository.changeCompletionDate(assessment.courseId,
          moment().toISOString());
      }
    });
}

function evaluateFromAssessmentId(assessmentId, parameters = {}) {

  let assessment;

  return assessmentRepository.get(assessmentId)
    .then((foundAssessment) => {

      assessment = foundAssessment;

      if (!assessment) {
        throw new NotFoundError();
      }

      if (assessment.isCompleted() && !parameters.recompute) {
        throw new AlreadyRatedAssessmentError();
      }

      return Promise.all([
        assessmentService.getSkills(assessment),
        assessmentService.getCompetenceMarks(assessment),
      ]);
    })
    .then(([skills, mark]) => _saveCertificationResult(assessment, assessmentId, skills, mark))
    .catch((error) => _saveResultAfterComputingError(error, assessment, assessmentId));
}

function save(assessmentResult, competenceMarks) {

  return _validatedDataForAllCompetenceMark(competenceMarks)
    .then(() => assessmentResultRepository.save(assessmentResult))
    .then((assessmentResult) => {
      const competenceMarksSaved = competenceMarks.map((competenceMark) => {
        competenceMark.assessmentResultId = assessmentResult.id;
        return competenceMarkRepository.save(competenceMark);
      });
      return Promise.all(competenceMarksSaved);
    });
}

module.exports = {
  save,
  evaluateFromAssessmentId,
};
