const _ = require('lodash');
const { pipe } = require('lodash/fp');

const MAX_LEVEL_TO_BE_AN_EASY_TUBE = 3;
const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;
const MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL = 2;

module.exports = {
  getFilteredSkillsForFirstChallenge,
  getFilteredSkillsForNextChallenge
};

function getFilteredSkillsForFirstChallenge({ knowledgeElements, courseTubes, targetSkills }) {
  return pipe(
    _getUntestedSkills.bind(null, knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, courseTubes),
    _removeTimedSkillsIfNeeded.bind(null, true),
    _focusOnDefaultLevel.bind(null),
  )(targetSkills);
}

function getFilteredSkillsForNextChallenge({ knowledgeElements, courseTubes, predictedLevel, isLastChallengeTimed, targetSkills }) {
  return pipe(
    _getUntestedSkills.bind(null,knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, courseTubes),
    _removeTimedSkillsIfNeeded.bind(null, isLastChallengeTimed),
    _removeTooDifficultSkills.bind(null, predictedLevel),
  )(targetSkills);
}

function _getUntestedSkills(knowledgeElements, skills) {
  return _.filter(skills, (skill) => !_skillAlreadyTested(skill, knowledgeElements));
}

function _getPrioritySkills(courseTubes) {
  return pipe(
    _getEasyTubes,
    _getSkillsFromTubes,
  )(courseTubes);
}

function _keepSkillsFromEasyTubes(courseTubes, targetSkills) {
  const skillsFromEasyTubes = _getPrioritySkills(courseTubes);
  const availableSkillsFromEasyTubes = _.intersectionBy(targetSkills, skillsFromEasyTubes, 'id');
  if (!_.isEmpty(availableSkillsFromEasyTubes)) {
    return availableSkillsFromEasyTubes;
  }
  return targetSkills;
}

function _getEasyTubes(courseTubes) {
  return _.filter(courseTubes, (tube) => tube.getHardestSkill().difficulty <= MAX_LEVEL_TO_BE_AN_EASY_TUBE);
}

function _getSkillsFromTubes(courseTubes) {
  return _.flatMap(courseTubes, (tube) => tube.skills);
}

function _skillAlreadyTested(skill, knowledgeElements) {
  const alreadyTestedSkillIds = _.map(knowledgeElements, 'skillId');
  return alreadyTestedSkillIds.includes(skill.id);
}

function _removeTimedSkillsIfNeeded(isLastChallengeTimed, targetSkills) {
  if (isLastChallengeTimed) {
    const skillsWithoutTimedChallenges = _.filter(targetSkills, (skill) => !skill.timed);
    return (skillsWithoutTimedChallenges.length > 0) ? skillsWithoutTimedChallenges : targetSkills;
  }
  return targetSkills;
}

function _focusOnDefaultLevel(targetSkills) {
  if (_.isEmpty(targetSkills)) {
    return targetSkills;
  }

  const remapDifficulty = (difficulty) => difficulty == DEFAULT_LEVEL_FOR_FIRST_CHALLENGE ? Number.MIN_VALUE : difficulty;
  const [, potentialFirstSkills] = _(targetSkills)
    .groupBy('difficulty')
    .entries()
    .minBy(([difficulty, _targetSkills]) => remapDifficulty(parseFloat(difficulty)));

  return potentialFirstSkills;

}

function _removeTooDifficultSkills(predictedLevel, targetSkills) {
  return _.filter(targetSkills, (skill) => !_isSkillTooHard(skill, predictedLevel));
}

function _isSkillTooHard(skill, predictedLevel) {
  return skill.difficulty - predictedLevel > MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL;
}

