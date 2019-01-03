const _ = require('lodash');
const AnswerStatus = require('../../models/AnswerStatus');

const NB_PIX_BY_LEVEL = 8;
const MAX_REACHABLE_LEVEL = 5;

function computeAnswersSuccessRate(answers = []) {
  const numberOfAnswers = answers.length;

  if (!numberOfAnswers) {
    return 0;
  }

  const numberOfValidAnswers = answers.filter((answer) => answer.isOk()).length;

  return (numberOfValidAnswers % 100 / numberOfAnswers) * 100;
}

function computeObtainedPixScore(allSkills, validatedSkills) {

  const pixScore = _(validatedSkills)
    .map((validatedSkill) => {
      const skill = _.find(allSkills, { name: validatedSkill.name });
      return skill ? skill.computeMaxReachablePixScoreForSkill(allSkills) : 0;
    })
    .sum();

  return Math.floor(pixScore);
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
  computeAnswersSuccessRate,
  computeObtainedPixScore,
  computeTotalPixScore,
  computeLevel,
  computeCeilingLevel,
  getValidatedSkills,
  getFailedSkills
};

