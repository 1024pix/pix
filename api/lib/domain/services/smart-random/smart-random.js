const Course = require('../../models/Course');
const catAlgorithm = require('./cat-algorithm');
const { getFilteredSkillsForNextChallenge, getFilteredSkillsForFirstChallenge } = require('./skills-filter');
const _ = require('lodash');

module.exports = { getPossibleSkillsForNextChallenge };

function getPossibleSkillsForNextChallenge({ knowledgeElements, challenges, targetSkills, lastAnswer } = {}) {

  const isUserStartingTheTest = !lastAnswer;
  const isLastChallengeTimed = _wasLastChallengeTimed(lastAnswer);
  const courseTubes = _findCourseTubes(targetSkills, challenges);
  const knowledgeElementsOfTargetSkills = knowledgeElements.filter((ke) => {
    return targetSkills.find((skill) => skill.id === ke.skillId);
  });
  const filteredChallenges = _removeUnpublishedChallenges(challenges);
  targetSkills = _getSkillsWithAddedInformations({ targetSkills, filteredChallenges });

  // First challenge has specific rules
  const { possibleSkillsForNextChallenge, levelEstimated } = isUserStartingTheTest
    ? _findFirstChallenge({ knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, courseTubes })
    : _findAnyChallenge({ knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, courseTubes, isLastChallengeTimed });

  // Test is considered finished when no challenges are returned but we don't expose this detail
  return possibleSkillsForNextChallenge.length > 0
    ? { hasAssessmentEnded: false, possibleSkillsForNextChallenge, levelEstimated }
    : { hasAssessmentEnded: true, possibleSkillsForNextChallenge, levelEstimated };
}

function _wasLastChallengeTimed(lastAnswer) {
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

function _findAnyChallenge({ knowledgeElements, targetSkills, courseTubes, isLastChallengeTimed }) {
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeElements, targetSkills);
  const availableSkills = getFilteredSkillsForNextChallenge({ knowledgeElements, courseTubes, predictedLevel, isLastChallengeTimed, targetSkills });
  const maxRewardingSkills = catAlgorithm.findMaxRewardingSkills({ availableSkills, predictedLevel, courseTubes, knowledgeElements });
  return { possibleSkillsForNextChallenge: maxRewardingSkills, levelEstimated: predictedLevel };
}

function _findFirstChallenge({ knowledgeElements, targetSkills, courseTubes }) {
  const filteredSkillsForFirstChallenge = getFilteredSkillsForFirstChallenge({ knowledgeElements, courseTubes, targetSkills });
  return { possibleSkillsForNextChallenge: filteredSkillsForFirstChallenge, levelEstimated: 2 };
}

function _getSkillsWithAddedInformations({ targetSkills, filteredChallenges }) {
  const skillsWithInformation =  _.map(targetSkills, (skill) => {
    const challenges = _.filter(filteredChallenges, (challenge) => challenge.hasSkill(skill));
    const [ firstChallenge ] = challenges;
    if (!firstChallenge) {
      return null;
    }
    const skillCopy = Object.create(skill);
    return Object.assign(skillCopy, {
      challenges,
      linkedSkills: _.reject(firstChallenge.skills, { id: skill.id }),
      timed: firstChallenge.isTimed(),
    });
  });
  return _.compact(skillsWithInformation);
}

function _removeUnpublishedChallenges(challenges) {
  return _.filter(challenges, (challenge) => challenge.isPublished());
}
