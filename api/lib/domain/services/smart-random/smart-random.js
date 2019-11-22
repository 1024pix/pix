const Course = require('../../models/Course');
const catAlgorithm = require('./cat-algorithm');
const { getFilteredSkillsForNextChallenge, getFilteredSkillsForFirstChallenge } = require('./skills-filter');
const _ = require('lodash');

const UNEXISTING_ITEM = null;

module.exports = { getNextChallenge };

function getNextChallenge({ knowledgeElements, challenges, targetSkills, lastAnswer } = {}) {

  const isUserStartingTheTest = !lastAnswer;
  const isLastChallengeTimed = _isLastAnswerWasOnTimedChallenge(lastAnswer);
  const courseTubes = _findCourseTubes(targetSkills, challenges);
  const knowledgeElementsOfTargetSkills = knowledgeElements.filter((ke) => {
    return targetSkills.find((skill) => skill.id === ke.skillId);
  });
  const filteredChallenges = _removeUnpublishedChallenges(challenges);
  targetSkills = _getSkillsWithAddedInformations({ targetSkills, filteredChallenges });

  // First challenge has specific rules
  const { nextChallenge, levelEstimated } = isUserStartingTheTest
    ? _findFirstChallenge({ challenges, knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, courseTubes })
    : _findAnyChallenge({ challenges, knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, courseTubes, isLastChallengeTimed });

  // Test is considered finished when no challenges are returned but we don't expose this detail
  return nextChallenge
    ? { hasAssessmentEnded: false, nextChallenge, levelEstimated }
    : { hasAssessmentEnded: true, nextChallenge: null, levelEstimated };
}

function _isLastAnswerWasOnTimedChallenge(lastAnswer) {
  return (_.get(lastAnswer,'timeout') === null) ? false : true;
}

function _findCourseTubes(skills, challenges) {
  const course = new Course();
  const listSkillsWithChallenges = _filterSkillsByChallenges(skills, challenges);
  course.competenceSkills = listSkillsWithChallenges;
  return course.computeTubes(listSkillsWithChallenges);
}

function _filterSkillsByChallenges(skills, challenges) {
  const skillsWithChallenges = skills.filter((skill) => {
    return challenges.find((challenge) => {
      return challenge.skills.find((challengeSkill) => skill.name === challengeSkill.name);
    });
  });
  return skillsWithChallenges;
}

function _findAnyChallenge({ challenges, knowledgeElements, targetSkills, courseTubes, isLastChallengeTimed }) {
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeElements, targetSkills);
  const availableSkills = getFilteredSkillsForNextChallenge({ challenges, knowledgeElements, courseTubes, predictedLevel, isLastChallengeTimed, targetSkills });
  const maxRewardingSkills = catAlgorithm.findMaxRewardingSkills({ availableSkills, predictedLevel, courseTubes, knowledgeElements });
  return { nextChallenge: _pickRandomChallenge(maxRewardingSkills), levelEstimated: predictedLevel };
}

function _findFirstChallenge({ challenges, knowledgeElements, targetSkills, courseTubes }) {
  const filteredSkillsForFirstChallenge = getFilteredSkillsForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills });
  return { nextChallenge: _pickRandomChallenge(filteredSkillsForFirstChallenge), levelEstimated: 2 };
}

function _pickRandomChallenge(skills) {
  if (skills.length === 0) { return UNEXISTING_ITEM; }
  const chosenSkill = _.sample(skills);
  return _.sample(chosenSkill.challenges);
}

function _getSkillsWithAddedInformations({ targetSkills, filteredChallenges }) {
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
