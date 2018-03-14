const moment = require('moment');

const AssessmentResult = require('../../domain/models/AssessmentResult');

const skillService = require('../../domain/services/skills-service');
const assessmentService = require('../../domain/services/assessment-service');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

const { NotFoundError, AlreadyRatedAssessmentError } = require('../../domain/errors');

function _getAssessmentResultEvaluations(marks, assessmentType) {
  const pixScore = marks.reduce((totalPixScore, mark) => {
    return totalPixScore + mark.score;
  }, 0);
  let level = Math.floor(pixScore / 8);
  let status = 'validated';
  if(pixScore === 0 && assessmentType === 'CERTIFICATION') {
    status = 'rejected';
    level = -1;
  }
  return { pixScore, level, status };
}

function evaluateFromAssessmentId(assessmentId) {

  let assessment;

  return assessmentRepository.get(assessmentId)
    .then((foundAssessment) => {

      assessment = foundAssessment;

      if (!assessment) {
        throw new NotFoundError();
      }

      if (assessment.isCompleted()) {
        throw new AlreadyRatedAssessmentError();
      }

      return Promise.all([
        assessmentService.getSkills(assessment),
        assessmentService.getCompetenceMarks(assessment)
      ]).then(([skills, marks]) => {
        const { pixScore, level, status } = _getAssessmentResultEvaluations(marks, assessment.type);
        const assessmentResult = new AssessmentResult({
          emitter: 'PIX-ALGO',
          comment: 'Computed',
          level: level,
          pixScore: pixScore,
          status,
          assessmentId
        });
        assessment.setCompleted();

        return Promise.all([
          assessmentResultRepository.save(assessmentResult),
          marks,
          skillService.saveAssessmentSkills(skills),
          assessmentRepository.save(assessment),
        ]);
      }).then(([assessmentResult, marks]) => {
        const assessmentResultId = assessmentResult.id;

        marks = marks.map((mark) => {
          mark.assessmentResultId = assessmentResultId;
          return mark;
        });
        return Promise.all(marks.map((mark) => competenceMarkRepository.save(mark)));
      }).then(() => {

        if (assessmentService.isCertificationAssessment(assessment)) {
          return certificationCourseRepository.changeCompletionDate(assessment.courseId,
            moment().toISOString());
        }
      });
    });
}

function save(assessmentResult, competenceMarks) {
  return assessmentResultRepository.save(assessmentResult)
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
  evaluateFromAssessmentId

};
