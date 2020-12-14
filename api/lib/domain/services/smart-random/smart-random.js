const _ = require('lodash');
const catAlgorithm = require('./cat-algorithm');
const { getFilteredSkillsForNextChallenge, getFilteredSkillsForFirstChallenge } = require('./skills-filter');
const { computeTubesFromSkills } = require('./../tube-service');

module.exports = { getPossibleSkillsForNextChallenge };

function getPossibleSkillsForNextChallenge({ knowledgeElements, challenges, targetSkills, lastAnswer, allAnswers } = {}) {

  const isUserStartingTheTest = !lastAnswer;
  const isLastChallengeTimed = _wasLastChallengeTimed(lastAnswer);
  const tubes = _findTubes(targetSkills, challenges);
  const knowledgeElementsOfTargetSkills = knowledgeElements.filter((ke) => {
    return targetSkills.find((skill) => skill.id === ke.skillId);
  });
  const filteredChallenges = _removeChallengesWithAnswer({ challenges, allAnswers });
  targetSkills = _getSkillsWithAddedInformations({ targetSkills, filteredChallenges });

  // First challenge has specific rules
  const { possibleSkillsForNextChallenge, levelEstimated } = isUserStartingTheTest
    ? _findFirstChallenge({ knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, tubes })
    : _findAnyChallenge({ knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, tubes, isLastChallengeTimed });

  // Test is considered finished when no challenges are returned but we don't expose this detail
  return possibleSkillsForNextChallenge.length > 0
    ? { hasAssessmentEnded: false, possibleSkillsForNextChallenge, levelEstimated }
    : { hasAssessmentEnded: true, possibleSkillsForNextChallenge, levelEstimated };
}

function _wasLastChallengeTimed(lastAnswer) {
  return (_.get(lastAnswer, 'timeout') === null) ? false : true;
}

function _findTubes(skills, challenges) {
  const listSkillsWithChallenges = _filterSkillsByChallenges(skills, challenges);
  return computeTubesFromSkills(listSkillsWithChallenges);
}

function _filterSkillsByChallenges(skills, challenges) {
  const skillsWithChallenges = skills.filter((skill) => {
    return challenges.find((challenge) => {
      return challenge.skills.find((challengeSkill) => skill.name === challengeSkill.name);
    });
  });
  return skillsWithChallenges;
}

function _findAnyChallenge({ knowledgeElements, targetSkills, tubes, isLastChallengeTimed }) {
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeElements, targetSkills);
  const availableSkills = getFilteredSkillsForNextChallenge({ knowledgeElements, tubes, predictedLevel, isLastChallengeTimed, targetSkills });
  const maxRewardingSkills = catAlgorithm.findMaxRewardingSkills({ availableSkills, predictedLevel, tubes, knowledgeElements });
  return { possibleSkillsForNextChallenge: maxRewardingSkills, levelEstimated: predictedLevel };
}

function _findFirstChallenge({ knowledgeElements, targetSkills, tubes }) {
  const filteredSkillsForFirstChallenge = getFilteredSkillsForFirstChallenge({ knowledgeElements, tubes, targetSkills });
  return { possibleSkillsForNextChallenge: filteredSkillsForFirstChallenge, levelEstimated: 2 };
}

function _getSkillsWithAddedInformations({ targetSkills, filteredChallenges }) {
  return _.map(targetSkills, (skill) => {
    const challenges = _.filter(filteredChallenges, (challenge) => challenge.hasSkill(skill));
    const [ firstChallenge ] = challenges;
    const skillCopy = Object.create(skill);
    return Object.assign(skillCopy, {
      challenges,
      linkedSkills: firstChallenge ? _.reject(firstChallenge.skills, { id: skill.id }) : [],
      timed: firstChallenge ? firstChallenge.isTimed() : false,
      isPlayable: !!firstChallenge,
    });
  });
}

function _removeChallengesWithAnswer({ challenges, allAnswers }) {
  const challengeIdsWithAnswer = allAnswers.map((answer) => answer.challengeId);
  return challenges.filter((challenge) => !_.includes(challengeIdsWithAnswer, challenge.id));
}
