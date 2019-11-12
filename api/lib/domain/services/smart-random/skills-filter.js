const _ = require('lodash');
const { pipe } = require('lodash/fp');

const MAX_LEVEL_TO_BE_AN_EASY_TUBE = 3;
const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;

module.exports = {
  getFilteredChallengesForFirstSkill,
  getFilteredChallengesForAnySkill
};

function getFilteredChallengesForFirstSkill({ challenges, knowledgeElements, courseTubes, targetSkills }) {
  const filteredChallenges = _removeUnpublishedChallenges(challenges);
  targetSkills = _addChallengesAndTimedInformation({ targetSkills, filteredChallenges });
  return pipe(
    _getUntestedSkills.bind(null, knowledgeElements),
  )(targetSkills);
}

function getFilteredChallengesForAnySkill({ challenges, knowledgeElements, courseTubes, predictedLevel, lastChallenge, targetSkills }) {
  const filteredChallenges = _removeUnpublishedChallenges(challenges);
  targetSkills = _addChallengesAndTimedInformation({ targetSkills, filteredChallenges });

  return pipe(
    _getUntestedSkills.bind(null, knowledgeElements),
  )(targetSkills);
}

function _addChallengesAndTimedInformation({ targetSkills, filteredChallenges }) {
  const skillsWithInformation =  _.map(targetSkills, (skill) => {
   skill.challenges = _.filter(filteredChallenges, (challenge) => challenge.hasSkill(skill));
   if (skill.challenges.length === 0) {
     return null;
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

function _skillAlreadyTested(skill, knowledgeElements) {
  const alreadyTestedSkillIds = _.map(knowledgeElements, 'skillId');
  return alreadyTestedSkillIds.includes(skill.id);
}
