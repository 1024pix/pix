const Course = require('../models/Course');
const _ = require('lodash');

const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;
const LEVEL_MAX_TO_BE_AN_EASY_TUBE = 3;

function _filterSkillsByChallenges(skills, challenges) {
  const skillsWithChallenges = skills.filter((skill) => {
    return challenges.find((challenge) => {
      return challenge.skills.find((challengeSkill) => skill.name === challengeSkill.name);
    });
  });

  return skillsWithChallenges;
}

function _probaOfCorrectAnswer(level, difficulty) {
  return 1 / (1 + Math.exp(-(level - difficulty)));
}

function _computeProbabilityOfCorrectLevelPredicted(level, knowledgeElements, skills) {
  //Trouver les acquis auxquelles ont a répondu directement
  const directKnowledgeElements = _.filter(knowledgeElements, (ke)=> ke.source === 'direct');
  const extraAnswers = directKnowledgeElements.map((ke)=> {
    const skill = skills.find((skill) => skill.id === ke.skillId);
    const maxDifficulty = skill.difficulty || 2;
    const binaryOutcome = (ke.status === 'validated') ? 1 : 0;
    return { binaryOutcome, maxDifficulty };
  });

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

  const diffBetweenResultAndProbaToResolve = extraAnswers.map((answer) =>
    answer.binaryOutcome - _probaOfCorrectAnswer(level, answer.maxDifficulty));

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
}

function _skillsToTargetInPriority(courseTubes, knowledgesElements) {
  let skillsToTargetInPriority = [];

  for (const tube in courseTubes) {
    const listOfSkillsForThisTube = courseTubes[tube].skills;

    const mostDifficultSkill = listOfSkillsForThisTube.sort((a, b) => a.difficulty < b.difficulty)[0];

    if (mostDifficultSkill.difficulty <= LEVEL_MAX_TO_BE_AN_EASY_TUBE) {

      const nbSkillsNotEvaluated = listOfSkillsForThisTube.filter((skill) => {
        return _skillNotKnownYet(skill, knowledgesElements);
      }).length;

      if (nbSkillsNotEvaluated !== 0) {
        skillsToTargetInPriority = skillsToTargetInPriority.concat(courseTubes[tube].skills);
      }
    }
  }

  return skillsToTargetInPriority;
}

function _isChallengeNotTooHard(challenge, predictedLevel) {
  return challenge.hardestSkill.difficulty - predictedLevel <= 2;
}

function _isAnAvailableChallenge(challenge, knowledgeElements, targetProfile) {
  return challenge.isPublished()
    && !challenge.hasAllSkilledAlreadyCovered(knowledgeElements, targetProfile);
}

function _isPreviousChallengeTimed(lastChallenge) {
  return lastChallenge && (lastChallenge.timer !== undefined);
}

function _extractNotTimedChallenge(availableChallenges) {
  return availableChallenges.filter((challenge) => challenge.timer === undefined);
}

function _skillNotKnownYet(skill, knowledgesElements) {
  const skillsAlreadyTested = _.map(knowledgesElements,'skillId');
  return !skillsAlreadyTested.includes(skill.id);
}

function _filterChallengesBySkills(listOfChallenges, listOfRequiredSkills) {

  return listOfChallenges.filter((challenge) => {

    let challengeContainsSkillsInTargetProfile = false;

    listOfRequiredSkills.map((skill) => skill.name).forEach((skillName) => {
      const challengeHasSkill = challenge.skills.map((skill) => skill.name).includes(skillName);
      if (challengeHasSkill) {
        challengeContainsSkillsInTargetProfile = true;
      }
    });

    return challengeContainsSkillsInTargetProfile;
  });
}

function _getNewSkillsInfoIfChallengeSolved(challenge, course, knowledgeElements) {
  return challenge.skills.reduce((extraValidatedSkills, skill) => {
    course.findTube(skill.tubeName).getEasierThan(skill).forEach((skill) => {
      if (_skillNotKnownYet(skill, knowledgeElements)) {
        extraValidatedSkills.push(skill);
      }
    });
    return extraValidatedSkills;
  }, []);
}

function _getNewSkillsInfoIfChallengeUnsolved(challenge, course, knowledgeElements) {
  return course.findTube(challenge.hardestSkill.tubeName).getHarderThan(challenge.hardestSkill)
    .reduce((extraFailedSkills, skill) => {
      if (_skillNotKnownYet(skill, knowledgeElements)) {
        extraFailedSkills.push(skill);
      }
      return extraFailedSkills;
    }, []);
}

function _computeReward({ challenge, predictedLevel, course, knowledgeElements }) {
  const proba = _probaOfCorrectAnswer(predictedLevel, challenge.hardestSkill.difficulty);
  const nbExtraSkillsIfSolved = _getNewSkillsInfoIfChallengeSolved(challenge, course, knowledgeElements).length;
  const nbFailedSkillsIfUnsolved = _getNewSkillsInfoIfChallengeUnsolved(challenge, course, knowledgeElements).length;

  return proba * nbExtraSkillsIfSolved + (1 - proba) * nbFailedSkillsIfUnsolved;
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

    this.predictedLevel = this.getPredictedLevel();
  }

  getNextChallenge() {
    const availableChallenges = SmartRandom._filteredChallenges({
      challenges: this.challenges,
      knowledgeElements: this.knowledgeElements,
      tubes: this.course.tubes,
      predictedLevel: this.predictedLevel,
      lastChallenge: this.lastChallenge,
      targetProfile: this.targetProfile
    });

    if (!this.lastAnswer) {
      return _firstChallenge({
        challenges: this.challenges,
        knowledgeElements: this.knowledgeElements,
        tubes: this.course.tubes,
        predictedLevel: this.predictedLevel,
        lastChallenge: this.lastChallenge,
        targetProfile: this.targetProfile,
        availableChallenges
      });
    }

    if (availableChallenges.length === 0) {
      return null;
    }

    const challengesAndRewards = _.map(availableChallenges, (challenge) => {
      return {
        challenge: challenge,
        reward: _computeReward({
          challenge,
          predictedLevel: this.predictedLevel,
          course: this.course,
          knowledgeElements: this.knowledgeElements
        })
      };
    });

    const challengeWithMaxReward = _.maxBy(challengesAndRewards, 'reward');
    const maxReward = challengeWithMaxReward.reward;

    if (this._testHasEnded(maxReward)) {
      return null;
    }

    const bestChallenges = challengesAndRewards
      .filter((challengeAndReward) => challengeAndReward.reward === maxReward)
      .map((challengeAndReward) => challengeAndReward.challenge);
    return _.sample(bestChallenges);
  }

  // The adaptative algorithm ends when there is nothing more to gain
  _testHasEnded(maxReward) {
    return maxReward === 0;
  }

  getPredictedLevel() {
    if (!this.lastAnswer) {
      return LEVEL_FOR_FIRST_CHALLENGE;
    }
    let maxLikelihood = -Infinity;
    let level = 0.5;
    let predictedLevel = 0.5;

    while (level < 8) {
      const likelihood = _computeProbabilityOfCorrectLevelPredicted(level, this.knowledgeElements, this.skills);
      if (likelihood > maxLikelihood) {
        maxLikelihood = likelihood;
        predictedLevel = level;
      }
      level += 0.5;
    }
    return predictedLevel;
  }

  static _filteredChallenges({ challenges, knowledgeElements, tubes, predictedLevel, lastChallenge, targetProfile }) {
    // Filter 1 : only available challenge : published and with skills not already tested
    let availableChallenges = challenges.filter((challenge) => _isAnAvailableChallenge(challenge, knowledgeElements, targetProfile));

    // Filter 2 : Do not ask timed challenge if previous challenge was timed
    if (_isPreviousChallengeTimed(lastChallenge)) {
      availableChallenges = _extractNotTimedChallenge(availableChallenges);
    }

    // Filter 3 : Do not ask challenge where level too high
    availableChallenges = availableChallenges.filter((challenge) => _isChallengeNotTooHard(challenge, predictedLevel));

    // Filter 4 : Priority to tubes with max level
    const listOfSkillsToTargetInPriority = _skillsToTargetInPriority(tubes, knowledgeElements);
    if (listOfSkillsToTargetInPriority.length > 0) {
      availableChallenges = _filterChallengesBySkills(availableChallenges, listOfSkillsToTargetInPriority);
    }

    return availableChallenges;
  }
}

module.exports = SmartRandom;
