const _ = require('lodash');
const moment = require('moment');

const CompetenceMark = require('../../domain/models/CompetenceMark');

const skillService = require('../../domain/services/skills-service');
const assessmentService = require('../../domain/services/assessment-service');
const certificationService = require('../../domain/services/certification-service');

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

const { AlreadyRatedAssessmentError, NotFoundError } = require('../errors');

function _getCompetenceMarksToSaveForCertificationAssessment(assessmentId) {
  return Promise
    .all([competenceRepository.list(), certificationService.calculateCertificationResultByAssessmentId(assessmentId)])
    .then(([competences, { competencesWithCompetenceMark }]) => {

      return competencesWithCompetenceMark.map((certifiedCompetence) => {

        const area_code = _(competences).find((competence) => {
          return competence.index === certifiedCompetence.index;
        }).area.code;

        return new CompetenceMark({
          level: certifiedCompetence.obtainedLevel,
          score: certifiedCompetence.obtainedScore,
          area_code,
          competence_code: certifiedCompetence.index,
          assessmentId: assessmentId
        });

      });
    });
}

function _getCompetenceMarksToSaveForPlacementTest(assessmentWithScore) {
  return courseRepository.get(assessmentWithScore.courseId)
    .then((course) => {
      return competenceRepository.get(course.competences[0]);
    })
    .then(competence => {
      return [
        new CompetenceMark({
          level: assessmentWithScore.estimatedLevel,
          score: assessmentWithScore.pixScore,
          area_code: competence.area.code,
          competence_code: competence.index,
          assessmentId: assessmentWithScore.id
        })
      ];
    });
}

function evaluateFromAssessmentId(assessmentId) {

  let assessmentWithScore;
  let evaluatedSkillsInAssessment;

  return assessmentRepository.get(assessmentId)
    .then((assessment) => {

      if(!assessment) {
        throw new NotFoundError();
      }

      if(assessment.isCompleted()) {
        throw new AlreadyRatedAssessmentError();
      }

      return assessmentService.fetchAssessment(assessmentId);
    }).then(({ assessmentPix, skills }) => {
      assessmentWithScore = assessmentPix;
      evaluatedSkillsInAssessment = skills;
    })
    .then(() => {

      if (assessmentService.isCertificationAssessment(assessmentWithScore)) {
        return _getCompetenceMarksToSaveForCertificationAssessment(assessmentWithScore.id);
      } else if (assessmentService.isPlacementAssessment(assessmentWithScore)) {
        return _getCompetenceMarksToSaveForPlacementTest(assessmentWithScore);
      } else {
        const noCompetenceMarksToSaveForPreviewAndDemo = [];
        return noCompetenceMarksToSaveForPreviewAndDemo;
      }

    })
    .then((marks) => {
      if(marks.length > 0) {
        const totalPix = _(marks).map((mark) => mark.score).sum();
        assessmentWithScore.pixScore = totalPix;
      }
      assessmentWithScore.status = 'completed';

      return Promise.all(marks.map((mark) => markRepository.save(mark)));
    })
    .then(() => skillService.saveAssessmentSkills(evaluatedSkillsInAssessment))
    .then(() => assessmentRepository.save(assessmentWithScore))
    .then(() => {

      if(assessmentService.isCertificaionAssessment(assessmentWithScore)) {
        return certificationCourseRepository.updateStatus('completed',
          assessmentWithScore.courseId,
          moment().toISOString());
      }
    });
}

module.exports = {
  evaluateFromAssessmentId
};
