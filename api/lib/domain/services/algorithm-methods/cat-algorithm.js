import KnowledgeElement from '../../models/KnowledgeElement';
import _ from 'lodash';
import { pipe } from 'lodash/fp';

export default {
  findMaxRewardingSkills,
  getPredictedLevel,
};

function getPredictedLevel(knowledgeElements, skills) {
  return _.maxBy(_enumerateCatLevels(), (level) =>
    _probabilityThatUserHasSpecificLevel(level, knowledgeElements, skills)
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
    const binaryOutcome = ke.status === KnowledgeElement.StatusType.VALIDATED ? 1 : 0;
    return { binaryOutcome, maxDifficulty };
  });

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

  const diffBetweenResultAndProbaToResolve = extraAnswers.map(
    (answer) => answer.binaryOutcome - _probaOfCorrectAnswer(level, answer.maxDifficulty)
  );

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
}

function findMaxRewardingSkills(...args) {
  return pipe(_getMaxRewardingSkills, _clearSkillsIfNotRewarding)(...args);
}

function _getMaxRewardingSkills({ availableSkills, predictedLevel, tubes, knowledgeElements }) {
  return _.reduce(
    availableSkills,
    (acc, skill) => {
      const skillReward = _computeReward({ skill, predictedLevel, tubes, knowledgeElements });
      if (skillReward > acc.maxReward) {
        acc.maxReward = skillReward;
        acc.maxRewardingSkills = [skill];
      } else if (skillReward === acc.maxReward) {
        acc.maxRewardingSkills.push(skill);
      }
      return acc;
    },
    { maxRewardingSkills: [], maxReward: -Infinity }
  ).maxRewardingSkills;
}

// Skills that won't bring anymore information on the user is a termination condition of the CAT algorithm
function _clearSkillsIfNotRewarding(skills) {
  return _.filter(skills, (skill) => skill.reward !== 0);
}

function _computeReward({ skill, predictedLevel, tubes, knowledgeElements }) {
  const proba = _probaOfCorrectAnswer(predictedLevel, skill.difficulty);
  const extraSkillsIfSolvedCount = _getNewSkillsInfoIfSkillSolved(skill, tubes, knowledgeElements).length;
  const failedSkillsIfUnsolvedCount = _getNewSkillsInfoIfSkillUnsolved(skill, tubes, knowledgeElements).length;

  return proba * extraSkillsIfSolvedCount + (1 - proba) * failedSkillsIfUnsolvedCount;
}

// The probability P(gap) of giving the correct answer is given by the "logistic function"
// https://en.wikipedia.org/wiki/Logistic_function
function _probaOfCorrectAnswer(userEstimatedLevel, challengeDifficulty) {
  return 1 / (1 + Math.exp(-(userEstimatedLevel - challengeDifficulty)));
}

function _getNewSkillsInfoIfSkillSolved(skillTested, tubes, knowledgeElements) {
  let extraValidatedSkills = _findTubeByName(tubes, skillTested.tubeNameWithoutPrefix)
    .getEasierThan(skillTested)
    .filter(_skillNotTestedYet(knowledgeElements));

  if (!_.isEmpty(skillTested.linkedSkills)) {
    extraValidatedSkills = _.concat(extraValidatedSkills, skillTested.linkedSkills);
  }
  return _.uniqBy(extraValidatedSkills, 'id');
}

function _getNewSkillsInfoIfSkillUnsolved(skillTested, tubes, knowledgeElements) {
  let extraFailedSkills = _findTubeByName(tubes, skillTested.tubeNameWithoutPrefix)
    .getHarderThan(skillTested)
    .filter(_skillNotTestedYet(knowledgeElements));

  if (!_.isEmpty(skillTested.linkedSkills)) {
    extraFailedSkills = _.concat(extraFailedSkills, skillTested.linkedSkills);
  }
  return _.uniqBy(extraFailedSkills, 'id');
}

function _findTubeByName(tubes, tubeName) {
  return tubes.find((tube) => tube.name === tubeName);
}

function _skillNotTestedYet(knowledgeElements) {
  return (skill) => {
    const skillsAlreadyTested = _.map(knowledgeElements, 'skillId');
    return !skillsAlreadyTested.includes(skill.id);
  };
}
