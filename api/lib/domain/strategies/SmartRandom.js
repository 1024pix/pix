const Course = require('../models/Course');
const { filteredChallenges, filteredChallengesForFirstChallenge } = require('./challengesFilter');
const { getPredictedLevel, computeReward } = require('./catAlgorithm');
const _ = require('lodash');

const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;
const TEST_ENDED_CHAR = null;
const UNEXISTING_ITEM = null;

module.exports = class SmartRandom {

  constructor({ knowledgeElements, challenges, targetProfile, answers } = {}) {
    this.challenges = challenges;
    this.targetProfile = targetProfile;
    this.skills = targetProfile.skills;
    this.knowledgeElements = knowledgeElements;
    this.lastChallenge = _findLastChallengeIfAny(answers, challenges);
    this.courseTubes = _findCourseTubes(this.skills, challenges);
    this.predictedLevel = getPredictedLevel(this.knowledgeElements, this.skills);
  }

  getNextChallenge() {

    if (!this.lastChallenge) {
      return _firstChallenge({
        challenges: this.challenges,
        knowledgeElements: this.knowledgeElements,
        courseTubes: this.courseTubes,
        targetProfile: this.targetProfile
      });
    }

    const availableChallenges = filteredChallenges({
      challenges: this.challenges,
      knowledgeElements: this.knowledgeElements,
      courseTubes: this.courseTubes,
      predictedLevel: this.predictedLevel,
      lastChallenge: this.lastChallenge,
      targetProfile: this.targetProfile
    });

    if (_hasNoMoreChallenges(availableChallenges)) {
      return TEST_ENDED_CHAR;
    }

    return _findNextChallengeWithCatAlgorithm({
      availableChallenges,
      predictedLevel: this.predictedLevel,
      courseTubes: this.courseTubes,
      knowledgeElements: this.knowledgeElements
    });
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

function _findPotentialFirstChallenges(challenges) {
  // first challenge difficulty should be the default one if possible, otherwise take the minimum difficulty
  const remapDifficulty = (difficulty) => difficulty == DEFAULT_LEVEL_FOR_FIRST_CHALLENGE ? Number.MIN_VALUE : difficulty;

  const [, potentialFirstChallenges] = _(challenges)
    .groupBy('hardestSkill.difficulty')
    .entries()
    .minBy(([difficulty, _challenges]) => remapDifficulty(parseFloat(difficulty)));
  return potentialFirstChallenges;
}

function _firstChallenge({ challenges, knowledgeElements, tubes, targetProfile }) {
  const filteredChallenges = filteredChallengesForFirstChallenge({ challenges, knowledgeElements, tubes, targetProfile });

  const [timedChallenges, notTimedChallenges] = _(filteredChallenges)
    .partition((challenge) => challenge.timer)
    .values()
    .value();

  let potentialFirstChallenges;

  if (notTimedChallenges.length > 0) { // not timed challenge are a priority
    potentialFirstChallenges = _findPotentialFirstChallenges(notTimedChallenges);
  } else {
    potentialFirstChallenges = _findPotentialFirstChallenges(timedChallenges);
  }

  return _pickRandomChallenge(potentialFirstChallenges);
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

function _filterSkillsByChallenges(skills, challenges) {
  const skillsWithChallenges = skills.filter((skill) => {
    return challenges.find((challenge) => {
      return challenge.skills.find((challengeSkill) => skill.name === challengeSkill.name);
    });
  });

  return skillsWithChallenges;
}

function _hasReachedAStabilityPoint(maxReward) {
  return _.isNumber(maxReward) && maxReward === 0;
}

function _hasNoMoreChallenges(challenges) {
  return _.isArray(challenges) && _.isEmpty(challenges);
}
