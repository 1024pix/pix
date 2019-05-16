const KnowledgeElement = require('../../models/KnowledgeElement');
const _ = require('lodash');
const { pipe } = require('lodash/fp');

// This file implements methods useful for a CAT algorithm
// https://en.wikipedia.org/wiki/Computerized_adaptive_testing
// https://en.wikipedia.org/wiki/Item_response_theory

module.exports = {
  findMaxRewardingChallenges,
  getPredictedLevel,
};

function getPredictedLevel(knowledgeElements, skills) {
  return _.maxBy(_enumerateCatLevels(),
    (level) => _probabilityThatUserHasSpecificLevel(level, knowledgeElements, skills)
  );
}

function _enumerateCatLevels() {
  const firstLevel = 0.5;
  const lastLevel = 8; // The upper boundary is not included in the range
  const levelStep = 0.5;
  return _.range(firstLevel, lastLevel, levelStep);
}

function _probabilityThatUserHasSpecificLevel(level, knowledgeElements, skills) {
  const directKnowledgeElements = _.filter(knowledgeElements, (ke) => ke.source === 'direct');
  const extraAnswers = directKnowledgeElements.map((ke) => {
    const skill = skills.find((skill) => skill.id === ke.skillId);
    const maxDifficulty = skill.difficulty || 2;
    const binaryOutcome = (ke.status === KnowledgeElement.StatusType.VALIDATED) ? 1 : 0;
    return { binaryOutcome, maxDifficulty };
  });

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

  const diffBetweenResultAndProbaToResolve = extraAnswers.map((answer) =>
    answer.binaryOutcome - _probaOfCorrectAnswer(level, answer.maxDifficulty));

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
}

function findMaxRewardingChallenges(...args) {
  return pipe(
    _getMaxRewardingChallenges,
    _clearChallengesIfNotRewarding
  )(...args);
}

function _getMaxRewardingChallenges({ availableChallenges, predictedLevel, courseTubes, knowledgeElements }) {
  return _.reduce(availableChallenges, (acc, challenge) => {
    const challengeReward = _computeReward({ challenge, predictedLevel, courseTubes, knowledgeElements });
    if (challengeReward > acc.maxReward) {
      acc.maxReward = challengeReward;
      acc.maxRewardingChallenges = [challenge];
    }
    else if (challengeReward === acc.maxReward) {
      acc.maxRewardingChallenges.push(challenge);
    }
    return acc;
  }, { maxRewardingChallenges: [], maxReward: -Infinity })
    .maxRewardingChallenges;
}

// Challenges that won't bring anymore information on the user is a termination condition of the CAT algorithm
function _clearChallengesIfNotRewarding(challenges) {
  return _.filter(challenges, (challenge) => challenge.reward !== 0);
}

function _computeReward({ challenge, predictedLevel, courseTubes, knowledgeElements }) {
  const proba = _probaOfCorrectAnswer(predictedLevel, challenge.hardestSkill.difficulty);
  const nbExtraSkillsIfSolved = _getNewSkillsInfoIfChallengeSolved(challenge, courseTubes, knowledgeElements).length;
  const nbFailedSkillsIfUnsolved = _getNewSkillsInfoIfChallengeUnsolved(challenge, courseTubes, knowledgeElements).length;

  return proba * nbExtraSkillsIfSolved + (1 - proba) * nbFailedSkillsIfUnsolved;
}

// The probability P(gap) of giving the correct answer is given by the "logistic function"
// https://en.wikipedia.org/wiki/Logistic_function
function _probaOfCorrectAnswer(userEstimatedLevel, challengeDifficulty) {
  return 1 / (1 + Math.exp(-(userEstimatedLevel - challengeDifficulty)));
}

function _getNewSkillsInfoIfChallengeSolved(challenge, courseTubes, knowledgeElements) {
  return challenge.skills.reduce((extraValidatedSkills, skill) => {
    _findTubeByName(courseTubes, skill.tubeName).getEasierThan(skill).forEach((skill) => {
      if (_skillNotTestedYet(skill, knowledgeElements)) {
        extraValidatedSkills.push(skill);
      }
    });
    return extraValidatedSkills;
  }, []);
}

function _getNewSkillsInfoIfChallengeUnsolved(challenge, courseTubes, knowledgeElements) {
  return _findTubeByName(courseTubes, challenge.hardestSkill.tubeName).getHarderThan(challenge.hardestSkill)
    .reduce((extraFailedSkills, skill) => {
      if (_skillNotTestedYet(skill, knowledgeElements)) {
        extraFailedSkills.push(skill);
      }
      return extraFailedSkills;
    }, []);
}

function _findTubeByName(courseTubes, tubeName) {
  return courseTubes.find((tube) => tube.name === tubeName);
}

function _skillNotTestedYet(skill, knowledgesElements) {
  const skillsAlreadyTested = _.map(knowledgesElements, 'skillId');
  return !skillsAlreadyTested.includes(skill.id);
}
