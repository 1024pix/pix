const _ = require('lodash');
const moment = require('moment');

const CompetenceMark = require('../../domain/models/CompetenceMark');
const AssessmentResult = require('../../domain/models/AssessmentResult');

const skillService = require('../../domain/services/skills-service');
const assessmentService = require('../../domain/services/assessment-service');
const certificationService = require('../../domain/services/certification-service');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

const { AlreadyRatedAssessmentError, NotFoundError } = require('../errors');

function evaluateFromAssessmentId(assessmentId) {

  let assessment;
  let assessmentWithResult;
  let evaluatedSkillsInAssessment;
  let assessmentResult;
  let assessmentResultId;

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
        const level = Math.ceil(pixScore / 8);
        const assessmentResult = new AssessmentResult({
          emitter: 'PIX-ALGO',
          comment: 'Computed',
          level: pixScore,
          pixScore: level,
          assessmentId
        });
        assessment.status = 'completed';

        return Promise.all([
          skillService.saveAssessmentSkills(skills),
          assessmentResultRepository.save(assessmentResult),
          assessmentRepository.save(assessment),
          marks
        ]);
      }).then(([skills, assessmentResult, assessment, marks]) => {
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


      /* return assessmentService.getSkills(assessmentId);
     }).then(({ assessmentPix, skills }) => {
       assessmentWithResult = assessmentPix;
       evaluatedSkillsInAssessment = skills;
       assessment.status = 'completed';
       assessmentResult = new AssessmentResult({
         emitter: 'PIX-ALGO',
         comment: 'Computed',
         level: assessmentWithResult.estimatedLevel,
         pixScore: assessmentWithResult.pixScore,
         assessmentId
       });
     })
     .then(() => assessmentResultRepository.save(assessmentResult))
     .then((assessmentResult) => {
       assessmentResultId = assessmentResult.id;
       return assessmentService.getCompetenceMarks(assessment);
     })
     .then((marks) => {
       return Promise.all(marks.map((mark) => competenceMarkRepository.save(mark)));
     })
     .then(() => skillService.saveAssessmentSkills(evaluatedSkillsInAssessment))
     .then(() => assessmentRepository.save(assessment))
     .then(() => {

       if(assessmentService.isCertificationAssessment(assessment)) {
         return certificationCourseRepository.changeCompletedDate(assessment.courseId,
           moment().toISOString());
       }
     });*/
    });
}

module.exports = {
  evaluateFromAssessmentId
};
