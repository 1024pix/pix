const Course = require('../models/Course');
const { filteredChallenges, filteredChallengeForFirstChallenge } = require('./challengesFilter');
const { getPredictedLevel, computeReward } = require('./catAlgorithm');
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
    this.predictedLevel = getPredictedLevel(this.knowledgeElements, this.targetSkills);
    this.isUserStartingTheTest = !this.lastChallenge;
  }

  getNextChallenge() {
    const smartRandom = Object.create(this);

    // First challenge has specific rules
    return this.isUserStartingTheTest
      ? _findFirstChallenge(smartRandom)
      : _findAnyChallenge(smartRandom);
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
  const availableChallenges = filteredChallenges({ challenges, knowledgeElements, courseTubes, predictedLevel, lastChallenge, targetSkills });
  if (_hasNoMoreChallenges(availableChallenges)) {
    return TEST_ENDED_CHAR;
  }
  return _findNextChallengeWithCatAlgorithm({ availableChallenges, predictedLevel, courseTubes, knowledgeElements });
}

function _findFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills }) {
  const filteredChallenges = filteredChallengeForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills });
  return _pickRandomChallenge(filteredChallenges);
}

function _pickRandomChallenge(challenges) {
  return _.sample(challenges);
}

function _findNextChallengeWithCatAlgorithm({ availableChallenges, predictedLevel, courseTubes, knowledgeElements }) {

  const challengesAndRewards = _.map(availableChallenges, (challenge) => {
    return {
      challenge: challenge,
      reward: computeReward({ challenge, predictedLevel, courseTubes, knowledgeElements })
    };
  });

  const challengeWithMaxReward = _.maxBy(challengesAndRewards, 'reward');
  const maxReward = challengeWithMaxReward.reward;

  if (_hasReachedAStabilityPoint(maxReward)) {
    return TEST_ENDED_CHAR;
  }

  const bestChallenges = challengesAndRewards
    .filter((challengeAndReward) => challengeAndReward.reward === maxReward)
    .map((challengeAndReward) => challengeAndReward.challenge);
  return _.sample(bestChallenges);
}

function _hasReachedAStabilityPoint(maxReward) {
  return _.isNumber(maxReward) && maxReward === 0;
}

function _hasNoMoreChallenges(challenges) {
  return _.isArray(challenges) && _.isEmpty(challenges);
}
