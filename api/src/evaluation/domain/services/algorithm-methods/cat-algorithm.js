import { logSkillReward } from '../smart-random-log-service.js';

export { findMaxRewardingSkills, getPredictedLevel };

const CAT_LEVELS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5];

const findMaxRewardingSkills = ({ availableSkills, predictedLevel, tubes, knowledgeState }) => {
  const maxRewardingSkills = getMaxRewardingSkills({ availableSkills, predictedLevel, tubes, knowledgeState });
  return clearSkillsIfNotRewarding(maxRewardingSkills);
};

/**
 * Estime le niveau de l'utilisateur à partir de ses seuls verdicts directs —
 * les questions réellement posées, jamais les acquis inférés.
 *
 * @param {KnowledgeState} knowledgeState restreint au périmètre visé
 */
const getPredictedLevel = (knowledgeState) => {
  const directVerdicts = knowledgeState.directVerdicts();
  const eachLevelWithProbability = CAT_LEVELS.map((level) => ({
    level,
    probability: probabilityThatUserHasSpecificLevel(level, directVerdicts),
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

const probabilityThatUserHasSpecificLevel = (level, directVerdicts) => {
  const extraAnswers = directVerdicts.map(({ level: difficulty, isValidated }) => ({
    binaryOutcome: isValidated ? 1 : 0,
    maxDifficulty: difficulty || 2,
  }));

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

  const diffBetweenResultAndProbaToResolve = extraAnswers.map(
    (answer) => answer.binaryOutcome - probaOfCorrectAnswer(level, answer.maxDifficulty),
  );

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
};

const findTubeByName = (tubes, tubeName) => tubes.find((tube) => tube.name === tubeName);

const skillNotTestedYet = (knowledgeState) => (skill) => !knowledgeState.isAssessed(skill);

const getNewSkillsInfoIfSkillSolved = (testedSkills, tubes, knowledgeState) =>
  findTubeByName(tubes, testedSkills.tubeNameWithoutPrefix)
    .getEasierThan(testedSkills)
    .filter(skillNotTestedYet(knowledgeState));

// Skills that won't bring anymore information on the user is a termination condition of the CAT algorithm
const clearSkillsIfNotRewarding = (skills) => skills.filter((skill) => skill.reward !== 0);

const getNewSkillsInfoIfSkillUnsolved = (testedSkills, tubes, knowledgeState) =>
  findTubeByName(tubes, testedSkills.tubeNameWithoutPrefix)
    .getHarderThan(testedSkills)
    .filter(skillNotTestedYet(knowledgeState));

const computeReward = ({ skill, predictedLevel, tubes, knowledgeState }) => {
  const proba = probaOfCorrectAnswer(predictedLevel, skill.difficulty);
  const extraSkillsIfSolvedCount = getNewSkillsInfoIfSkillSolved(skill, tubes, knowledgeState).length;
  const failedSkillsIfUnsolvedCount = getNewSkillsInfoIfSkillUnsolved(skill, tubes, knowledgeState).length;

  return proba * extraSkillsIfSolvedCount + (1 - proba) * failedSkillsIfUnsolvedCount;
};

const getMaxRewardingSkills = ({ availableSkills, predictedLevel, tubes, knowledgeState }) =>
  availableSkills.reduce(
    (maxRewardingSkills, skill) => {
      const skillReward = computeReward({ skill, predictedLevel, tubes, knowledgeState });
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
