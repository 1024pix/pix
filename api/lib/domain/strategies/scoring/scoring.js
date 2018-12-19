const _ = require('lodash');
const AnswerStatus = require('../../models/AnswerStatus');

const NB_PIX_BY_LEVEL = 8;
const MAX_REACHABLE_LEVEL = 5;

function computeObtainedPixScore(allSkills, validatedSkills) {
  const pixScoreBySkill = [];

  allSkills.forEach((skill) => pixScoreBySkill[skill.name] = skill.computeMaxReachablePixScoreForSkill(allSkills));

  const realScore = validatedSkills
    .map((skill) => pixScoreBySkill[skill.name] || 0)
    .reduce((a, b) => a + b, 0);

  return Math.floor(realScore);
}

function computeTotalPixScore(pixScores) {
  return _.sum(pixScores);
}

function computeLevel(pixScore) {
  return Math.floor(pixScore / NB_PIX_BY_LEVEL);
}

function computeCeilingLevel(level) {
  return Math.min(level, MAX_REACHABLE_LEVEL);
}

function getValidatedSkills(answers, challenges, tubes) {
  return answers
    .filter((answer) => AnswerStatus.isOK(answer.result))
    .reduce((validatedSkills, answer) => {
      challenges
        .filter((challenge) => challenge.id === answer.challengeId)
        .filter((challenge) => challenge.skills)
        .map((challenge) => {
          challenge.skills.forEach((skill) => {
            const tube = tubes.find((t) => t.name === skill.tubeName);
            tube.getEasierThan(skill).forEach((easierSkill) => {
              if (!validatedSkills.includes(easierSkill))
                validatedSkills.push(easierSkill);
            });
          });
        });
      return validatedSkills;
    }, []);
}

function getFailedSkills(answers, challenges, tubes) {
  // FIXME refactor !
  // XXX we take the current failed skill and all the harder skills in
  // its tube and mark them all as failed
  return answers
    .filter((answer) => AnswerStatus.isFailed(answer.result))
    .reduce((validatedSkills, answer) => {
      challenges
        .filter((challenge) => challenge.id === answer.challengeId)
        .filter((challenge) => challenge.skills)
        .map((challenge) => {
          challenge.skills.forEach((skill) => {
            const tube = tubes.find((tube) => tube.name === skill.tubeName);
            tube.getHarderThan(skill).forEach((easierSkill) => {
              if (!validatedSkills.includes(easierSkill))
                validatedSkills.push(easierSkill);
            });
          });
        });
      return validatedSkills;
    }, []);
}

module.exports = {
  computeObtainedPixScore,
  computeTotalPixScore,
  computeLevel,
  computeCeilingLevel,
  getValidatedSkills,
  getFailedSkills
};
