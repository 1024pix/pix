const _ = require('lodash');
const { pipe } = require('lodash/fp');

const MAX_LEVEL_TO_BE_AN_EASY_TUBE = 3;
const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;

module.exports = {
  getFilteredSkillsForFirstChallenge,
  getFilteredSkillsForNextChallenge
};

function getFilteredSkillsForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills }) {
  const filteredChallenges = _removeUnpublishedChallenges(challenges);
  targetSkills = _addChallengesAndTimedInformation({ targetSkills, filteredChallenges });
  return pipe(
    _getUntestedSkills.bind(null, knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, courseTubes),
    _removeTimedSkillsIfNeeded.bind(null, null),
    _focusOnDefaultLevel.bind(null),
  )(targetSkills);
}

function getFilteredSkillsForNextChallenge({ challenges, knowledgeElements, courseTubes, predictedLevel, isLastChallengeTimed, targetSkills }) {
  const filteredChallenges = _removeUnpublishedChallenges(challenges);
  targetSkills = _addChallengesAndTimedInformation({ targetSkills, filteredChallenges });

  return pipe(
    _getUntestedSkills.bind(null,knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, courseTubes),
    _removeTimedSkillsIfNeeded.bind(null, isLastChallengeTimed),
    _removeTooDifficultSkills.bind(null, predictedLevel),
  )(targetSkills);
}

function _addChallengesAndTimedInformation({ targetSkills, filteredChallenges }) {
  const skillsWithInformation =  _.map(targetSkills, (skill) => {
    skill.challenges = _.filter(filteredChallenges, (challenge) => challenge.hasSkill(skill));
    if (skill.challenges.length === 0) {
      return null;
    }
    skill.linkedSkills = [];
    if (skill.challenges[0].skills.length > 1) {
      skill.linkedSkills = _.filter(skill.challenges[0].skills, (skillFromChallenge) => skillFromChallenge.id != skill.id);
    }
    skill.timed = skill.challenges[0].isTimed();
    return skill;
  });
  return _.without(skillsWithInformation, null);
}

function _removeUnpublishedChallenges(challenges) {
  return _.filter(challenges, (challenge) => challenge.isPublished());
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
  const availableSkillsFromEasyTubes = _.intersectionBy(skillsFromEasyTubes, targetSkills, 'id');
  if (availableSkillsFromEasyTubes.length > 0) {
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
    const targetSkillsWihtoutSkillsWithTimedChallenges = _.filter(targetSkills, (skill) => !skill.timed);
    return (targetSkillsWihtoutSkillsWithTimedChallenges.length > 0) ? targetSkillsWihtoutSkillsWithTimedChallenges : targetSkills;
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
  return skill.difficulty - predictedLevel > 2;
}

