const _ = require('lodash');
const { pipe } = require('lodash/fp');
const constants = require('../../constants.js');

module.exports = {
  getFilteredSkillsForFirstChallenge,
  getFilteredSkillsForNextChallenge,
};

function getFilteredSkillsForFirstChallenge({ knowledgeElements, tubes, targetSkills }) {
  return pipe(
    _getPlayableSkill,
    _getUntestedSkills.bind(null, knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, tubes),
    _removeTimedSkillsIfNeeded.bind(null, true),
    _focusOnDefaultLevel.bind(null)
  )(targetSkills);
}

function getFilteredSkillsForNextChallenge({
  knowledgeElements,
  tubes,
  predictedLevel,
  isLastChallengeTimed,
  targetSkills,
}) {
  return pipe(
    _getPlayableSkill,
    _getUntestedSkills.bind(null, knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, tubes),
    _removeTimedSkillsIfNeeded.bind(null, isLastChallengeTimed),
    _removeTooDifficultSkills.bind(null, predictedLevel)
  )(targetSkills);
}

function _getUntestedSkills(knowledgeElements, skills) {
  return _.filter(skills, _skillNotAlreadyTested(knowledgeElements));
}

function _getPlayableSkill(skills) {
  return _.filter(skills, (skill) => skill.isPlayable);
}

function _getPrioritySkills(tubes) {
  return pipe(_getEasyTubes, _getSkillsFromTubes)(tubes);
}

function _keepSkillsFromEasyTubes(tubes, targetSkills) {
  const skillsFromEasyTubes = _getPrioritySkills(tubes);
  const availableSkillsFromEasyTubes = _.intersectionBy(targetSkills, skillsFromEasyTubes, 'id');
  if (!_.isEmpty(availableSkillsFromEasyTubes)) {
    return availableSkillsFromEasyTubes;
  }
  return targetSkills;
}

function _getEasyTubes(tubes) {
  return _.filter(tubes, (tube) => tube.getHardestSkill().difficulty <= constants.MAX_LEVEL_TO_BE_AN_EASY_TUBE);
}

function _getSkillsFromTubes(tubes) {
  return _.flatMap(tubes, (tube) => tube.skills);
}

function _skillNotAlreadyTested(knowledgeElements) {
  return (skill) => {
    const alreadyTestedSkillIds = _.map(knowledgeElements, 'skillId');
    return !alreadyTestedSkillIds.includes(skill.id);
  };
}

function _removeTimedSkillsIfNeeded(isLastChallengeTimed, targetSkills) {
  if (isLastChallengeTimed) {
    const skillsWithoutTimedChallenges = _.filter(targetSkills, (skill) => !skill.timed);
    return skillsWithoutTimedChallenges.length > 0 ? skillsWithoutTimedChallenges : targetSkills;
  }
  return targetSkills;
}

function _focusOnDefaultLevel(targetSkills) {
  if (_.isEmpty(targetSkills)) {
    return targetSkills;
  }

  const remapDifficulty = (difficulty) =>
    difficulty == constants.DEFAULT_LEVEL_FOR_FIRST_CHALLENGE ? Number.MIN_VALUE : difficulty;
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
  return skill.difficulty - predictedLevel > constants.MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL;
}
