const _ = require('lodash');
const AssessmentScore = require('../../models/AssessmentScore');
const AnswerStatus = require('../../models/AnswerStatus');
const CompetenceMark = require('../../models/CompetenceMark');

const NB_PIX_BY_LEVEL = 8;

async function calculate({ answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository }, assessment) {

  const course = await courseRepository.get(assessment.courseId);

  const [answers, challenges, competence, competenceSkills] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    challengeRepository.findByCompetenceId(course.competences[0]),
    competenceRepository.get(course.competences[0]),
    skillRepository.findByCompetenceId(course.competences[0]),
  ]);
  course.competenceSkills = competenceSkills;
  course.computeTubes(course.competenceSkills);

  const validatedSkills = _getValidatedSkills(answers, challenges, course.tubes);

  const failedSkills = _getFailedSkills(answers, challenges, course.tubes);

  const nbPix = _computeObtainedPixScore(course.competenceSkills, validatedSkills);

  const level = _computeLevel(nbPix);

  const competenceMarks = [new CompetenceMark({
    level: level,
    score: nbPix,
    area_code: competence.area.code,
    competence_code: competence.index
  })];

  return new AssessmentScore({
    level,
    nbPix,
    validatedSkills,
    failedSkills,
    competenceMarks,
  });
}

function _getValidatedSkills(answers, challenges, tubes) {
  return answers
    .filter((answer) => AnswerStatus.isOK(answer.result))
    .reduce((validatedSkills, answer) => {
      const challenge = challenges.find((challenge) => challenge.id === answer.challengeId);
      if (challenge && challenge.skills) {
        challenge.skills.forEach((skill) => {
          const tube = tubes.find((tube) => tube.name === skill.tubeName);
          tube.getEasierThan(skill).forEach((easierSkill) => {
            if (!validatedSkills.includes(easierSkill))
              validatedSkills.push(easierSkill);
          });
        });
      }
      return validatedSkills;
    }, []);
}

function _getFailedSkills(answers, challenges, tubes) {
  return answers
    .filter((answer) => AnswerStatus.isFailed(answer.result))
    .reduce((failedSkills, answer) => {
      const challenge = challenges.find((challenge) => challenge.id === answer.challengeId);
      if (challenge && challenge.skills) {
        challenge.skills.forEach((skill) => {
          const tube = tubes.find((tube) => tube.name === skill.tubeName);
          tube.getHarderThan(skill).forEach((harderSkill) => {
            if (!failedSkills.includes(harderSkill))
              failedSkills.push(harderSkill);
          });
        });
      }
      return failedSkills;
    }, []);
}

function _computeLevel(pixScore) {
  return Math.floor(pixScore / NB_PIX_BY_LEVEL);
}

function _computeObtainedPixScore(allSkills, validatedSkills) {

  const pixScore = _(validatedSkills)
    .map((validatedSkill) => {
      const skill = _.find(allSkills, { name: validatedSkill.name });
      return skill ? skill.computeMaxReachablePixScoreForSkill(allSkills) : 0;
    })
    .sum();

  return Math.floor(pixScore);
}

module.exports = {

  // public
  calculate,

  // private (for easier testing)
  // TODO create a sub-package "placement" in domain/services/scoring to clean this
  _computeLevel,
  _computeObtainedPixScore,
  _getFailedSkills,
  _getValidatedSkills,
};
