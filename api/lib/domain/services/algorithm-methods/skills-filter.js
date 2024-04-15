import { SmartRandomDetails } from '../../../../src/evaluation/domain/models/SmartRandomDetails.js';
import { STEPS_NAMES } from '../../../../src/evaluation/domain/models/SmartRandomStep.js';
import {
  DEFAULT_LEVEL_FOR_FIRST_CHALLENGE,
  MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL,
  MAX_LEVEL_TO_BE_AN_EASY_TUBE,
} from '../../constants.js';

const getPlayableSkills = (skills) => skills.filter(({ isPlayable }) => isPlayable);
const notAlreadyTestedSkill = (knowledgeElements) => (skill) => {
  const alreadyTestedSkillIds = knowledgeElements.map(({ skillId }) => skillId);
  return !alreadyTestedSkillIds.includes(skill.id);
};
const getUntestedSkills = (knowledgeElements, skills) => skills.filter(notAlreadyTestedSkill(knowledgeElements));

const keepSkillsFromEasyTubes = (tubes, targetSkills) => {
  const skillsFromEasyTubes = getPrioritySkills(tubes);
  const availableSkillsFromEasyTubes = targetSkills.filter((targetSkill) =>
    skillsFromEasyTubes.map(({ id }) => id).includes(targetSkill.id),
  );
  return availableSkillsFromEasyTubes.length ? availableSkillsFromEasyTubes : targetSkills;
};

const removeTimedSkillsIfNeeded = (isLastChallengeTimed, targetSkills) => {
  if (isLastChallengeTimed) {
    const skillsWithoutTimedChallenges = targetSkills.filter(({ timed }) => !timed);
    return skillsWithoutTimedChallenges.length > 0 ? skillsWithoutTimedChallenges : targetSkills;
  }
  return targetSkills;
};

const getPrioritySkills = (tubes) => {
  const easyTubes = getEasyTubes(tubes);
  return getSkillsFromTubes(easyTubes);
};

const getEasyTubes = (tubes) =>
  tubes?.filter((tube) => tube.getHardestSkill().difficulty <= MAX_LEVEL_TO_BE_AN_EASY_TUBE);
const getSkillsFromTubes = (tubes) => (tubes ? tubes.flatMap(({ skills }) => skills) : []);

const remapDifficulty = (difficulty) =>
  Number(difficulty) === DEFAULT_LEVEL_FOR_FIRST_CHALLENGE ? Number.MIN_VALUE : Number(difficulty);

const focusOnDefaultLevel = (targetSkills) =>
  targetSkills.reduce((defaultLevelSkills, skill) => {
    if (defaultLevelSkills.length === 0) {
      defaultLevelSkills.push(skill);
      return defaultLevelSkills;
    }

    const currentSkillRemappedDifficulty = remapDifficulty(skill.difficulty);
    const accumulatorFirstSkillRemappedDifficulty = remapDifficulty(defaultLevelSkills[0].difficulty);

    if (currentSkillRemappedDifficulty < accumulatorFirstSkillRemappedDifficulty) {
      defaultLevelSkills = [skill];
    }

    if (currentSkillRemappedDifficulty === accumulatorFirstSkillRemappedDifficulty) {
      defaultLevelSkills.push(skill);
    }

    return defaultLevelSkills;
  }, []);

const isSkillTooHard = (skill, predictedLevel) =>
  skill.difficulty - predictedLevel > MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL;

const removeTooDifficultSkills = (predictedLevel, targetSkills) =>
  targetSkills.filter((skill) => !isSkillTooHard(skill, predictedLevel));

const getFilteredSkillsForFirstChallenge = ({ knowledgeElements, tubes, targetSkills }) => {
  const smartRandomDetails = new SmartRandomDetails();

  const playableSkills = getPlayableSkills(targetSkills);
  smartRandomDetails.addStep(STEPS_NAMES.NO_CHALLENGE, playableSkills);

  const untestedSkills = getUntestedSkills(knowledgeElements, playableSkills);
  smartRandomDetails.addStep(STEPS_NAMES.ALREADY_TESTED, untestedSkills);

  const skillsFromEasyTubes = keepSkillsFromEasyTubes(tubes, untestedSkills);
  smartRandomDetails.addStep(STEPS_NAMES.EASY_TUBES, skillsFromEasyTubes);

  const skillsWithoutTimedSkills = removeTimedSkillsIfNeeded(true, skillsFromEasyTubes);
  smartRandomDetails.addStep(STEPS_NAMES.TIMED_SKILLS, skillsWithoutTimedSkills);

  const skillsFocusedOnDefaultLevel = focusOnDefaultLevel(skillsWithoutTimedSkills);
  smartRandomDetails.addStep(STEPS_NAMES.DEFAULT_LEVEL, skillsFocusedOnDefaultLevel);

  return { availableSkills: skillsFocusedOnDefaultLevel, smartRandomDetails };
};

const getFilteredSkillsForNextChallenge = ({
  knowledgeElements,
  tubes,
  predictedLevel,
  isLastChallengeTimed,
  targetSkills,
}) => {
  const smartRandomDetails = new SmartRandomDetails();
  smartRandomDetails.predictedLevel = predictedLevel;

  const playableSkills = getPlayableSkills(targetSkills);
  smartRandomDetails.addStep(STEPS_NAMES.NO_CHALLENGE, playableSkills);

  const untestedSkills = getUntestedSkills(knowledgeElements, playableSkills);
  smartRandomDetails.addStep(STEPS_NAMES.ALREADY_TESTED, untestedSkills);

  const skillsFromEasyTubes = keepSkillsFromEasyTubes(tubes, untestedSkills);
  smartRandomDetails.addStep(STEPS_NAMES.EASY_TUBES, skillsFromEasyTubes);

  const skillsWithoutTimedSkills = removeTimedSkillsIfNeeded(isLastChallengeTimed, skillsFromEasyTubes);
  smartRandomDetails.addStep(STEPS_NAMES.TIMED_SKILLS, skillsWithoutTimedSkills);

  const skillsWithoutTooDifficultSkills = removeTooDifficultSkills(predictedLevel, skillsWithoutTimedSkills);
  smartRandomDetails.addStep(STEPS_NAMES.TOO_DIFFICULT, skillsWithoutTooDifficultSkills);

  return { availableSkills: skillsWithoutTooDifficultSkills, smartRandomDetails };
};

export { focusOnDefaultLevel, getFilteredSkillsForFirstChallenge, getFilteredSkillsForNextChallenge };
