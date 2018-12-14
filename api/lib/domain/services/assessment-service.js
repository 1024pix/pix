const courseRepository = require('../../infrastructure/repositories/course-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const answerService = require('../services/answer-service');
const certificationService = require('../services/certification-service');

const CompetenceMark = require('../../domain/models/CompetenceMark');
const Assessment = require('../../domain/models/Assessment');
const AssessmentResult = require('../../domain/models/AssessmentResult');

const _ = require('../../infrastructure/utils/lodash-utils');

const { NotFoundError } = require('../../domain/errors');

// FIXME: Devrait plutot 1) splitter entre les calculs des acquis 2) calcul du result
/**
 * @deprecated since getSkillsReport and getCompetenceMarks
 */
async function fetchAssessment(assessmentId) {

  const assessment = await assessmentRepository.get(assessmentId);

  if (!assessment) {
    return Promise.reject(new NotFoundError(`Unable to find assessment with ID ${assessmentId}`));
  }

  const answers = await answerRepository.findByAssessment(assessmentId);

  assessment.estimatedLevel = 0;
  assessment.pixScore = 0;
  assessment.successRate = answerService.getAnswersSuccessRate(answers);

  const response = { assessmentPix: assessment, skills: null };

  if (!assessment.isPlacementAssessment()) {
    return Promise.resolve(response);
  }

  const course = await courseRepository.get(assessment.courseId);

  const [competenceSkills, challenges] = await Promise.all([
    skillRepository.findByCompetenceId(course.competences[0]),
    challengeRepository.findByCompetenceId(course.competences[0])
  ]);

  course.competenceSkills = competenceSkills;
  course.computeTubes(course.competenceSkills);

  assessment.pixScore = AssessmentResult.ComputePixScore(course.competenceSkills, challenges, answers, course.tubes);
  assessment.estimatedLevel = AssessmentResult.ComputeLevel(assessment.pixScore);

  response.skills = {
    assessmentId,
    validatedSkills: AssessmentResult.GetValidatedSkills(answers, challenges, course.tubes),
    failedSkills: AssessmentResult.GetFailedSkills(answers, challenges, course.tubes),
  };

  return Promise.resolve(response);
}

async function getSkillsReport(assessment) {
  if (!assessment) {
    return Promise.reject(new NotFoundError('Unable to getSkillsReport without assessment'));
  }

  const skillsReport = {
    assessmentId: assessment.id,
    validatedSkills: [],
    failedSkills: []
  };

  if (!assessment.isPlacementAssessment()) {
    return Promise.resolve(skillsReport);
  }

  const course = await courseRepository.get(assessment.courseId);

  const [competenceSkills, answers] = await Promise.all([
    skillRepository.findByCompetenceId(course.competences[0]),
    answerRepository.findByAssessment(assessment.id)
  ]);

  course.competenceSkills = competenceSkills;
  course.computeTubes(course.competenceSkills);

  skillsReport.validatedSkills = AssessmentResult.GetValidatedSkills(answers, course.challenges, course.tubes);
  skillsReport.failedSkills = AssessmentResult.GetFailedSkills(answers, course.challenges, course.tubes);

  return Promise.resolve(skillsReport);
}

function getCompetenceMarks(assessment) {

  if (assessment.isPlacementAssessment()) {
    let pixScore;
    let level;
    return courseRepository.get(assessment.courseId)
      .then((course) => {
        return Promise.all([
          answerRepository.findByAssessment(assessment.id),
          skillRepository.findByCompetenceId(course.competences[0]),
          challengeRepository.findByCompetenceId(course.competences[0]),
        ]).then(([answers, competenceSkills, challenges]) => {
          course.competenceSkills = competenceSkills;
          course.computeTubes(competenceSkills);
          pixScore = AssessmentResult.ComputePixScore(course.competenceSkills, challenges, answers, course.tubes);
          level = AssessmentResult.ComputeLevel(pixScore);
          return course;
        });
      }).then((course) => competenceRepository.get(course.competences[0])
      ).then((competence) => {
        return [
          new CompetenceMark({
            level,
            score: pixScore,
            area_code: competence.area.code,
            competence_code: competence.index
          })
        ];
      });
  }

  if (this.isCertificationAssessment(assessment)) {
    return Promise
      .all([competenceRepository.list(), certificationService.calculateCertificationResultByAssessmentId(assessment.id)])
      .then(([competences, { competencesWithMark }]) => {
        return competencesWithMark.map((certifiedCompetence) => {

          const area_code = _(competences).find((competence) => {
            return competence.index === certifiedCompetence.index;
          }).area.code;

          return new CompetenceMark({
            level: certifiedCompetence.obtainedLevel,
            score: certifiedCompetence.obtainedScore,
            area_code,
            competence_code: certifiedCompetence.index,
          });

        });
      });
  }

  return [];
}

// TODO Move the below functions into Assessment
function isPreviewAssessment(assessment) {
  return assessment.type === Assessment.types.PREVIEW;
}

function isDemoAssessment(assessment) {
  return assessment.type === Assessment.types.DEMO;
}

function isCertificationAssessment(assessment) {
  return assessment.type === Assessment.types.CERTIFICATION;
}

module.exports = {
  fetchAssessment,
  isPreviewAssessment,
  isDemoAssessment,
  isCertificationAssessment,
  getSkillsReport,
  getCompetenceMarks,
};
