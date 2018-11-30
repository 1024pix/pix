const Course = require('../models/Course');
const { filteredChallenges, filteredChallengeForFirstChallenge } = require('./challengesFilter');
const { getPredictedLevel, computeReward } = require('./catAlgorithm');
const _ = require('lodash');

const LEVEL_FOR_FIRST_CHALLENGE = 2;
const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;
const LEVEL_MAX_TO_BE_AN_EASY_TUBE = 3;

class SmartRandom {

  constructor({ knowledgeElements, challenges, targetProfile, answers } = {}) {
    this.challenges = challenges;
    this.targetProfile = targetProfile;
    this.skills = targetProfile.skills;
    this.knowledgeElements = knowledgeElements;

    this.course = new Course();
    const listSkillsWithChallenges = _filterSkillsByChallenges(this.skills, challenges);
    this.course.competenceSkills = listSkillsWithChallenges;
    this.course.computeTubes(listSkillsWithChallenges);

    this.lastAnswer = answers[answers.length-1];
    this.lastChallenge = null;
    if(this.lastAnswer) {
      this.lastChallenge = challenges.find((challenge) => challenge.id === this.lastAnswer.challengeId);
    }

    this.predictedLevel = (this.lastAnswer) ? getPredictedLevel(this.knowledgeElements, this.skills) : LEVEL_FOR_FIRST_CHALLENGE;
  }

  getNextChallenge() {

    if (!this.lastAnswer) {
      return _firstChallenge({
        challenges: this.challenges,
        knowledgeElements: this.knowledgeElements,
        tubes: this.course.tubes,
        targetProfile: this.targetProfile
      });
    }

    const availableChallenges = filteredChallenges({
      challenges: this.challenges,
      knowledgeElements: this.knowledgeElements,
      tubes: this.course.tubes,
      predictedLevel: this.predictedLevel,
      lastChallenge: this.lastChallenge,
      targetProfile: this.targetProfile
    });

    if (availableChallenges.length === 0) {
      return null;
    }

    return _findNextChallengeWithCatAlgorithm({
      availableChallenges,
      predictedLevel: this.predictedLevel,
      course: this.course,
      knowledgeElements: this.knowledgeElements
    });
  }

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

function _firstChallenge(challenges, answers, tubes, validatedSkills, failedSkills, predictedLevel) {
  const filteredChallenges = SmartRandom._filteredChallenges(challenges, answers, tubes, validatedSkills, failedSkills, predictedLevel);

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

  return _.sample(potentialFirstChallenges);
}

function _findNextChallengeWithCatAlgorithm({ availableChallenges, predictedLevel, course, knowledgeElements }) {

  const challengesAndRewards = _.map(availableChallenges, (challenge) => {
    return {
      challenge: challenge,
      reward: computeReward({
        challenge,
        predictedLevel: predictedLevel,
        course: course,
        knowledgeElements: knowledgeElements
      })
    };
  });

  const challengeWithMaxReward = _.maxBy(challengesAndRewards, 'reward');
  const maxReward = challengeWithMaxReward.reward;

  if (_testHasEnded(maxReward)) {
    return null;
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

function _testHasEnded(maxReward) {
  return maxReward === 0;
}

module.exports = SmartRandom;
