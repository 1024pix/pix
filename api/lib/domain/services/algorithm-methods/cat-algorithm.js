import { KnowledgeElement } from '../../models/KnowledgeElement.js';

export { findMaxRewardingSkills, getPredictedLevel };

const CAT_LEVELS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5];

const findMaxRewardingSkills = ({ availableSkills, predictedLevel, tubes, knowledgeElements }) => {
  const maxRewardingSkills = getMaxRewardingSkills({ availableSkills, predictedLevel, tubes, knowledgeElements });
  return clearSkillsIfNotRewarding(maxRewardingSkills);
};

const getPredictedLevel = (knowledgeElements, skills) => {
  const eachLevelWithProbability = CAT_LEVELS.map((level) => ({
    level,
    probability: probabilityThatUserHasSpecificLevel(level, knowledgeElements, skills),
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

const probabilityThatUserHasSpecificLevel = (level, knowledgeElements, skills) => {
  const directKnowledgeElements = knowledgeElements.filter(
    (knowledgeElement) => knowledgeElement.source === KnowledgeElement.SourceType.DIRECT,
  );
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
    (answer) => answer.binaryOutcome - probaOfCorrectAnswer(level, answer.maxDifficulty),
  );

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
};

const findTubeByName = (tubes, tubeName) => tubes.find((tube) => tube.name === tubeName);

const skillNotTestedYet = (knowledgeElements) => (skill) => {
  const skillsAlreadyTested = knowledgeElements.map(({ skillId }) => skillId);
  return !skillsAlreadyTested.includes(skill.id);
};

const getNewSkillsInfoIfSkillSolved = (testedSkills, tubes, knowledgeElements) =>
  findTubeByName(tubes, testedSkills.tubeNameWithoutPrefix)
    .getEasierThan(testedSkills)
    .filter(skillNotTestedYet(knowledgeElements));

// Skills that won't bring anymore information on the user is a termination condition of the CAT algorithm
const clearSkillsIfNotRewarding = (skills) => skills.filter((skill) => skill.reward !== 0);

const getNewSkillsInfoIfSkillUnsolved = (testedSkills, tubes, knowledgeElements) =>
  findTubeByName(tubes, testedSkills.tubeNameWithoutPrefix)
    .getHarderThan(testedSkills)
    .filter(skillNotTestedYet(knowledgeElements));

const computeReward = ({ skill, predictedLevel, tubes, knowledgeElements }) => {
  const proba = probaOfCorrectAnswer(predictedLevel, skill.difficulty);
  const extraSkillsIfSolvedCount = getNewSkillsInfoIfSkillSolved(skill, tubes, knowledgeElements).length;
  const failedSkillsIfUnsolvedCount = getNewSkillsInfoIfSkillUnsolved(skill, tubes, knowledgeElements).length;

  return proba * extraSkillsIfSolvedCount + (1 - proba) * failedSkillsIfUnsolvedCount;
};

const getMaxRewardingSkills = ({ availableSkills, predictedLevel, tubes, knowledgeElements }) =>
  availableSkills.reduce(
    (maxRewardingSkills, skill) => {
      const skillReward = computeReward({ skill, predictedLevel, tubes, knowledgeElements });
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
