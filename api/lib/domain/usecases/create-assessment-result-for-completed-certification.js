const moment = require('moment');

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');

const { CertificationComputeError, NotFoundError, AlreadyRatedAssessmentError } = require('../errors');

const CERTIFICATION_MAX_LEVEL = 5;

module.exports = function({
  assessmentId,
  parameters = {},
  assessmentResultRepository,
  assessmentRepository,
  assessmentService,
  certificationCourseRepository,
  competenceMarkRepository,
  skillsService,
}) {

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

  function _saveResultAfterComputingError(error, assessment, assessmentId) {
    if (error instanceof CertificationComputeError) {
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
        if (assessment.isCertificationAssessment()) {
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
      skillsService.saveAssessmentSkills(skills),
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
        if (assessment.isCertificationAssessment()) {
          return certificationCourseRepository.changeCompletionDate(assessment.courseId,
            moment().toISOString());
        }
      });
  }

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
};
