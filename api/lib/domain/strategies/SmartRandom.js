const Course = require('../models/Course');
const catAlgorithm = require('./catAlgorithm');
const { getFilteredChallengesForAnyChallenge, getFilteredChallengesForFirstChallenge } = require('./challengesFilter');
const _ = require('lodash');

const TEST_ENDED_CHAR = null;
const UNEXISTING_ITEM = null;

module.exports = { getNextChallenge };

function getNextChallenge({ knowledgeElements, challenges, targetProfile, answers } = {}) {

  const lastChallenge = _findLastChallengeIfAny(answers, challenges);
  const targetSkills = targetProfile.skills;
  const isUserStartingTheTest = !lastChallenge;
  const courseTubes = _findCourseTubes(targetSkills, challenges);

  // First challenge has specific rules
  const nextChallenge = isUserStartingTheTest
    ? _findFirstChallenge({ knowledgeElements, challenges, targetSkills, courseTubes })
    : _findAnyChallenge({ knowledgeElements, challenges, targetSkills, lastChallenge });

  // Test is considered finished when it returns null
  return nextChallenge || TEST_ENDED_CHAR;
}

function _findLastChallengeIfAny(answers, challenges) {
  const lastAnswer = _.last(answers);
  if (lastAnswer) {
    return challenges.find((challenge) => challenge.id === lastAnswer.challengeId) || UNEXISTING_ITEM;
  }
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

function _findAnyChallenge({ challenges, knowledgeElements, targetSkills, lastChallenge }) {
  const courseTubes = _findCourseTubes(targetSkills, challenges);
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeElements, targetSkills);
  const availableChallenges = getFilteredChallengesForAnyChallenge({ challenges, knowledgeElements, courseTubes, predictedLevel, lastChallenge, targetSkills });
  const maxRewardingChallenges = catAlgorithm.findMaxRewardingChallenges({ availableChallenges, predictedLevel, courseTubes, knowledgeElements });
  return _pickRandomChallenge(maxRewardingChallenges);
}

function _findFirstChallenge({ challenges, knowledgeElements, targetSkills, courseTubes }) {
  const filteredChallengesForFirstChallenge = getFilteredChallengesForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills });
  return _pickRandomChallenge(filteredChallengesForFirstChallenge);
}

function _pickRandomChallenge(challenges) {
  return _.sample(challenges);
}

