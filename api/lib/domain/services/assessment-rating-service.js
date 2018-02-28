const moment = require('moment');

const AssessmentResult = require('../../domain/models/AssessmentResult');

const skillService = require('../../domain/services/skills-service');
const assessmentService = require('../../domain/services/assessment-service');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

const { AlreadyRatedAssessmentError, NotFoundError } = require('../errors');

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
        assessmentService.getSkills(assessmentId),
        assessmentService.getCompetenceMarks(assessment)
      ]).then(([skills, marks]) => {

        const pixScore = marks.reduce((totalPixScore, mark) => {
          return totalPixScore + mark.score;
        }, 0);
        const level = Math.floor(pixScore / 8);
        const assessmentResult = new AssessmentResult({
          emitter: 'PIX-ALGO',
          comment: 'Computed',
          level: level,
          pixScore: pixScore,
          assessmentId
        });
        assessment.status = 'completed';

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
          return certificationCourseRepository.changeCompletedDate(assessment.courseId,
            moment().toISOString());
        }
      });
    });
}

module.exports = {
  evaluateFromAssessmentId
};
