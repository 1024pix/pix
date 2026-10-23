import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';
import { logSkillReward } from '../smart-random-log-service.js';

export { findMaxRewardingSkills, getPredictedLevel };

const CAT_LEVELS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5];

const findMaxRewardingSkills = ({ availableSkills, predictedLevel, tubes, knowledgeElements }) => {
  // Tube names are unique (see computeTubesFromSkills), so indexing them loses nothing.
  const tubesByName = new Map(tubes.map((tube) => [tube.name, tube]));
  const testedSkillIds = new Set(knowledgeElements.map(({ skillId }) => skillId));
  const maxRewardingSkills = getMaxRewardingSkills({ availableSkills, predictedLevel, tubesByName, testedSkillIds });

  return clearSkillsIfNotRewarding(maxRewardingSkills);
};

const getPredictedLevel = (knowledgeElements, skills) => {
  const answers = getAnswersFromDirectKnowledgeElements(knowledgeElements, skills);
  const eachLevelWithProbability = CAT_LEVELS.map((level) => ({
    level,
    probability: probabilityThatUserHasSpecificLevel(level, answers),
  }));
  const maximumProbabilityThatUserHasSpecificLevel = Math.max(
    ...eachLevelWithProbability.map(({ probability }) => probability),
  );

  return eachLevelWithProbability.find(({ probability }) => probability === maximumProbabilityThatUserHasSpecificLevel)
    .level;
};

// The probability P(gap) of giving the correct answer is given by the "logistic function"
// https://en.wikipedia.org/wiki/Logistic_function
const probaOfCorrectAnswer = (userEstimatedLevel, challengeDifficulty) =>
  1 / (1 + Math.exp(-(userEstimatedLevel - challengeDifficulty)));

// Each direct knowledge element is an answer whose outcome tells about the user level,
// framed by two sentinel answers that bound the estimation.
const getAnswersFromDirectKnowledgeElements = (knowledgeElements, skills) => {
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
  const answers = knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.source === KnowledgeElement.SourceType.DIRECT)
    .map((ke) => {
      const skill = skillsById.get(ke.skillId);
      const maxDifficulty = skill.difficulty || 2;
      const binaryOutcome = ke.status === KnowledgeElement.StatusType.VALIDATED ? 1 : 0;
      return { binaryOutcome, maxDifficulty };
    });

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  return [...answers, answerThatAnyoneCanSolve, answerThatNobodyCanSolve];
};

const probabilityThatUserHasSpecificLevel = (level, answers) => {
  const diffBetweenResultAndProbaToResolve = answers.map(
    (answer) => answer.binaryOutcome - probaOfCorrectAnswer(level, answer.maxDifficulty),
  );

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
};

const skillNotTestedYet = (testedSkillIds) => (skill) => !testedSkillIds.has(skill.id);

const getNewSkillsInfoIfSkillSolved = (testedSkill, tubesByName, testedSkillIds) =>
  tubesByName
    .get(testedSkill.tubeNameWithoutPrefix)
    .getEasierThan(testedSkill)
    .filter(skillNotTestedYet(testedSkillIds));

// Skills that won't bring anymore information on the user is a termination condition of the CAT algorithm
const clearSkillsIfNotRewarding = (skills) => skills.filter((skill) => skill.reward !== 0);

const getNewSkillsInfoIfSkillUnsolved = (testedSkill, tubesByName, testedSkillIds) =>
  tubesByName
    .get(testedSkill.tubeNameWithoutPrefix)
    .getHarderThan(testedSkill)
    .filter(skillNotTestedYet(testedSkillIds));

const computeReward = ({ skill, predictedLevel, tubesByName, testedSkillIds }) => {
  const proba = probaOfCorrectAnswer(predictedLevel, skill.difficulty);
  const extraSkillsIfSolvedCount = getNewSkillsInfoIfSkillSolved(skill, tubesByName, testedSkillIds).length;
  const failedSkillsIfUnsolvedCount = getNewSkillsInfoIfSkillUnsolved(skill, tubesByName, testedSkillIds).length;

  return proba * extraSkillsIfSolvedCount + (1 - proba) * failedSkillsIfUnsolvedCount;
};

const getMaxRewardingSkills = ({ availableSkills, predictedLevel, tubesByName, testedSkillIds }) =>
  availableSkills.reduce(
    (maxRewardingSkills, skill) => {
      const skillReward = computeReward({ skill, predictedLevel, tubesByName, testedSkillIds });
      logSkillReward(skill.id, skillReward);
      if (skillReward > maxRewardingSkills.maxReward) {
        maxRewardingSkills.maxReward = skillReward;
        maxRewardingSkills.maxRewardingSkills = [skill];
      } else if (skillReward === maxRewardingSkills.maxReward) {
        maxRewardingSkills.maxRewardingSkills.push(skill);
      }
      return maxRewardingSkills;
    },
    { maxRewardingSkills: [], maxReward: -Infinity },
  ).maxRewardingSkills;
