import _ from 'lodash';

const REACH_LEVEL_POINTS = 40;
const DIFFICULTY_POINTS = 30;
const PROGRESS_POINTS = 20;
const NEXT_STEP_POINTS = 10;
const DEFAULT_REACHED_LEVEL = 0;

function _getSkillOfMaxDifficulty(skills) {
  return _.maxBy(skills, 'difficulty');
}

function computeRecommendationScore(skillsOfTube, maxSkillLevel, validatedKnowledgeElements) {
  const skillOfMaxDifficulty = _getSkillOfMaxDifficulty(skillsOfTube);
  const reachedLevelInTube = _getReachedLevelInTube(validatedKnowledgeElements, skillsOfTube);

  const reachedLevelScore = _computeReachedLevelScore(skillOfMaxDifficulty, reachedLevelInTube);
  const difficultyScore = _computeDifficultyScore(maxSkillLevel, skillOfMaxDifficulty);
  const progressScore = _computeProgressScore(skillsOfTube, validatedKnowledgeElements);
  const nextStepScore = _computeNextStepScore(skillsOfTube, validatedKnowledgeElements, reachedLevelInTube);

  return reachedLevelScore + difficultyScore + progressScore + nextStepScore;
}

function _computeReachedLevelScore(skill, reachedLevelInTube) {
  return (REACH_LEVEL_POINTS / skill.difficulty) * reachedLevelInTube;
}

function _computeProgressScore(skillsOfTube, validatedKnowledgeElements) {
  return (PROGRESS_POINTS / skillsOfTube.length) * validatedKnowledgeElements.length;
}

function _computeNextStepScore(skillsOfTube, validatedKnowledgeElements, reachedLevelInTube) {
  if (_.isEmpty(validatedKnowledgeElements)) {
    return 0;
  }

  const nextLevelToReach = _getNextLevelToReach(skillsOfTube, validatedKnowledgeElements);
  return (NEXT_STEP_POINTS / nextLevelToReach) * reachedLevelInTube;
}

function _computeDifficultyScore(maxSkillLevel, skill) {
  return (DIFFICULTY_POINTS / maxSkillLevel) * skill.difficulty;
}

function _getNextLevelToReach(skillsOfTube, validatedKnowledgeElements) {
  const nextSkillToAcquire = _(skillsOfTube).reject(_isSkillValidated(validatedKnowledgeElements)).minBy('difficulty');

  if (!nextSkillToAcquire) {
    return _getSkillOfMaxDifficulty(skillsOfTube).difficulty;
  }

  return nextSkillToAcquire.difficulty;
}

function _getReachedLevelInTube(validatedKnowledgeElements, skillsOfTube) {
  const skillsOfTubeWithKnowledgeElement = skillsOfTube.filter(({ id }) =>
    _.find(validatedKnowledgeElements, { skillId: id })
  );
  const reachSkill = _getSkillOfMaxDifficulty(skillsOfTubeWithKnowledgeElement);

  return reachSkill ? reachSkill.difficulty : DEFAULT_REACHED_LEVEL;
}

function _isSkillValidated(validatedKnowledgeElements) {
  return (skill) => _.map(validatedKnowledgeElements, 'skillId').includes(skill.id);
}

export default {
  computeRecommendationScore,
};
