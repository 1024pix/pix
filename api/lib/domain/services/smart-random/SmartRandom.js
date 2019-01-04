const Course = require('../../models/Course');
const { getFilteredChallengesForAnyChallenge, getFilteredChallengesForFirstChallenge } = require('./challengesFilter');
const catAlgorithm = require('./catAlgorithm');
const _ = require('lodash');

const TEST_ENDED_CHAR = null;
const UNEXISTING_ITEM = null;

module.exports = class SmartRandom {

  constructor({ knowledgeElements, challenges, targetProfile, answers } = {}) {
    this.challenges = challenges;
    this.targetSkills = targetProfile.skills;
    this.knowledgeElements = knowledgeElements;
    this.lastChallenge = _findLastChallengeIfAny(answers, challenges);
    this.courseTubes = _findCourseTubes(this.targetSkills, challenges);
    this.predictedLevel = catAlgorithm.getPredictedLevel(this.knowledgeElements, this.targetSkills);
    this.isUserStartingTheTest = !this.lastChallenge;
  }

  getNextChallenge() {
    const smartRandom = Object.create(this);

    // First challenge has specific rules
    const nextChallenge = this.isUserStartingTheTest
      ? _findFirstChallenge(smartRandom)
      : _findAnyChallenge(smartRandom);

    // Test is considered finished when it returns null
    return nextChallenge || TEST_ENDED_CHAR;
  }
};

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

function _findAnyChallenge({ challenges, knowledgeElements, courseTubes, targetSkills, predictedLevel, lastChallenge }) {
  const availableChallenges = getFilteredChallengesForAnyChallenge({ challenges, knowledgeElements, courseTubes, predictedLevel, lastChallenge, targetSkills });
  const maxRewardingChallenges = catAlgorithm.findMaxRewardingChallenges({ availableChallenges, predictedLevel, courseTubes, knowledgeElements });
  return _pickRandomChallenge(maxRewardingChallenges);
}

function _findFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills }) {
  const filteredChallengesForFirstChallenge = getFilteredChallengesForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills });
  return _pickRandomChallenge(filteredChallengesForFirstChallenge);
}

function _pickRandomChallenge(challenges) {
  return _.sample(challenges);
}
