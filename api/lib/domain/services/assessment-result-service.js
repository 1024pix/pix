const moment = require('moment');

const AssessmentResult = require('../../domain/models/AssessmentResult');
const CompetenceMark = require('../models/CompetenceMark');

const skillService = require('../../domain/services/skills-service');
const assessmentService = require('../../domain/services/assessment-service');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

const { NotFoundError, AlreadyRatedAssessmentError } = require('../../domain/errors');

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

        const pixScore = marks.reduce((totalPixScore, mark) => {
          return totalPixScore + mark.score;
        }, 0);
        let level = Math.floor(pixScore / 8);
        let status = 'validated';
        if(pixScore === 0) {
          status = 'rejected';
          level = -1;
        }
        const assessmentResult = new AssessmentResult({
          emitter: 'PIX-ALGO',
          comment: 'Computed',
          level: level,
          pixScore: pixScore,
          status,
          assessmentId
        });
        assessment.state = 'completed';

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

  save(assessmentResultInfo) {
    const certificationId = assessmentResultInfo['certification-id'];
    const competenceMarks = assessmentResultInfo['competences-with-mark'];

    return assessmentRepository.getByCertificationCourseId(certificationId)
      .then((assessment) => {

        const assessmentResult = {
          assessmentId: assessment.id,
          emitter: assessmentResultInfo.emitter,
          status: assessmentResultInfo.status,
          comment: assessmentResultInfo.comment,
          level: assessmentResultInfo.level,
          pixScore: assessmentResultInfo['pix-score'],
        };
        return assessmentResultRepository.save(new AssessmentResult(assessmentResult));
      })
      .then((assessmentResult) => {

        const competenceMarksSaved = competenceMarks.map((competenceMark) => {
          const competenceMarkSaved = {
            level: competenceMark.level,
            score: competenceMark.score,
            area_code: competenceMark['area-code'],
            competence_code: competenceMark['competence-code'],
            assessmentResultId: assessmentResult.id
          };

          return competenceMarkRepository.save(new CompetenceMark(competenceMarkSaved));
        });
        return Promise.all(competenceMarksSaved);
      });
  },
  evaluateFromAssessmentId

};
