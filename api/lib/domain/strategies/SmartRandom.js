const Assessment = require('../models/Assessment');
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

function _randomly() {
  return 0.5 - Math.random();
}

function _probaOfCorrectAnswer(level, difficulty) {
  return 1 / (1 + Math.exp(-(level - difficulty)));
}

function _computeLikelihood(level, answers) {
  const extraAnswers = answers.map((answer) => {
    return { binaryOutcome: answer.binaryOutcome, maxDifficulty: answer.maxDifficulty() };
  });

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

  const diffBetweenResultAndProbaToResolve = extraAnswers.map((answer) =>
    answer.binaryOutcome - _probaOfCorrectAnswer(level, answer.maxDifficulty));

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
}

function _skillsToTargetInPriority(courseTubes, validatedSkills, failedSkills) {
  let skillsToTargetInPriority = [];

  for (const tube in courseTubes) {
    const listOfSkillsForThisTube = courseTubes[tube].skills;

    const mostDifficultSkill = listOfSkillsForThisTube.sort((a, b) => a.difficulty < b.difficulty)[0];

    if (mostDifficultSkill.difficulty <= LEVEL_MAX_TO_BE_AN_EASY_TUBE) {

      const nbSkillsNotEvaluated = listOfSkillsForThisTube.filter((skill) => {
        return _skillNotKnownYet(skill, validatedSkills, failedSkills);
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

function _isNotAnsweredYet(challenge, answers) {
  const findAnswersForThisChallenge = answers.find((answer) => answer.challengeId == challenge.id);
  return !findAnswersForThisChallenge;
}

function _isAnAvailableChallenge(challenge, assessedSkills, answers) {
  return challenge.isPublished()
    && challenge.testsAtLeastOneNewSkill(assessedSkills)
    && _isNotAnsweredYet(challenge, answers);
}

function _isPreviousChallengeTimed(answers) {
  const answeredChallenges = answers.map((answer) => answer.challenge);
  const lastAnswer = answers[answeredChallenges.length - 1];
  if (!lastAnswer || !lastAnswer.challenge) return false;
  return lastAnswer && (lastAnswer.challenge.timer !== undefined);
}

function _extractNotTimedChallenge(availableChallenges) {
  return availableChallenges.filter((challenge) => challenge.timer === undefined);
}

function _skillNotKnownYet(skill, validatedSkills, failedSkills) {
  return !validatedSkills.includes(skill) && !failedSkills.includes(skill);
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

function _getNewSkillsInfoIfChallengeSolved(challenge, course, validatedSkills, failedSkills) {
  return challenge.skills.reduce((extraValidatedSkills, skill) => {
    course.findTube(skill.tubeName).getEasierThan(skill).forEach((skill) => {
      if (_skillNotKnownYet(skill, validatedSkills, failedSkills)) {
        extraValidatedSkills.push(skill);
      }
    });
    return extraValidatedSkills;
  }, []);
}

function _getNewSkillsInfoIfChallengeUnsolved(challenge, course, validatedSkills, failedSkills) {
  return course.findTube(challenge.hardestSkill.tubeName).getHarderThan(challenge.hardestSkill)
    .reduce((extraFailedSkills, skill) => {
      if (_skillNotKnownYet(skill, validatedSkills, failedSkills)) {
        extraFailedSkills.push(skill);
      }
      return extraFailedSkills;
    }, []);
}

function _computeReward(challenge, predictedLevel, course, validatedSkills, failedSkills) {
  const proba = _probaOfCorrectAnswer(predictedLevel, challenge.hardestSkill.difficulty);
  const nbExtraSkillsIfSolved = _getNewSkillsInfoIfChallengeSolved(challenge, course, validatedSkills, failedSkills).length;
  const nbFailedSkillsIfUnsolved = _getNewSkillsInfoIfChallengeUnsolved(challenge, course, validatedSkills, failedSkills).length;

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

  constructor({ answers, challenges, targetProfile } = {}) {
    this.challenges = challenges;
    this.targetProfile = targetProfile;
    this.skills = targetProfile.skills;

    this.course = new Course();
    const listSkillsWithChallenges = _filterSkillsByChallenges(this.skills, challenges);
    this.course.competenceSkills = listSkillsWithChallenges;
    this.course.computeTubes(listSkillsWithChallenges);

    this.assessment = new Assessment();
    this.assessment.addAnswersWithTheirChallenge(answers, challenges);
    this.assessment.course = this.course;

    this.answers = this.assessment.answers;
  }

  getNextChallenge() {

    if (this.answers.length === 0) {
      return _firstChallenge(
        this.challenges,
        this.answers,
        this.course.tubes,
        this.validatedSkills,
        this.failedSkills,
        this.getPredictedLevel());
    }

    const availableChallenges = SmartRandom._filteredChallenges(
      this.challenges,
      this.answers,
      this.course.tubes,
      this.validatedSkills,
      this.failedSkills,
      this.getPredictedLevel());

    if (availableChallenges.length === 0) {
      return null;
    }

    const predictedLevel = this.getPredictedLevel();
    const challengesAndRewards = availableChallenges.map((challenge) => {
      return {
        challenge: challenge,
        reward: _computeReward(
          challenge,
          predictedLevel,
          this.course,
          this.validatedSkills,
          this.failedSkills)
      };
    });

    const challengeWithMaxReward = _.maxBy(challengesAndRewards, 'reward');
    const maxReward = challengeWithMaxReward.reward;

    if (maxReward === 0) {
      return null;
    }

    const bestChallenges = challengesAndRewards
      .filter((challengeAndReward) => challengeAndReward.reward === maxReward)
      .map((challengeAndReward) => challengeAndReward.challenge);
    return bestChallenges.sort(_randomly)[0];
  }

  get score() {
    return this.assessment.computePixScore();
  }

  get validatedSkills() {
    return this.assessment.getValidatedSkills();
  }

  get failedSkills() {
    return this.assessment.getFailedSkills();
  }

  getPredictedLevel() {
    if (this.answers.length === 0) {
      return DEFAULT_LEVEL_FOR_FIRST_CHALLENGE;
    }
    let maxLikelihood = -Infinity;
    let level = 0.5;
    let predictedLevel = 0.5;

    while (level < 8) {
      const likelihood = _computeLikelihood(level, this.answers);
      if (likelihood > maxLikelihood) {
        maxLikelihood = likelihood;
        predictedLevel = level;
      }
      level += 0.5;
    }
    return predictedLevel;
  }

  /**
   * XXX: this is public only to be tested and thus ensure bug PF-231 is fixed. DO NOT USE.
   *
   * @private
   * @deprecated
   */
  static _filteredChallenges(challenges, answers, tubes, validatedSkills, failedSkills, predictedLevel) {

    const assessedSkills = _.union(validatedSkills, failedSkills);
    let availableChallenges = challenges.filter((challenge) => _isAnAvailableChallenge(challenge, assessedSkills, answers));

    if (_isPreviousChallengeTimed(answers)) {
      availableChallenges = _extractNotTimedChallenge(availableChallenges);
    }

    availableChallenges = availableChallenges.filter((challenge) => _isChallengeNotTooHard(challenge, predictedLevel));

    const listOfSkillsToTargetInPriority = _skillsToTargetInPriority(tubes, validatedSkills, failedSkills);
    if (listOfSkillsToTargetInPriority.length > 0) {
      availableChallenges = _filterChallengesBySkills(availableChallenges, listOfSkillsToTargetInPriority);
    }

    return availableChallenges;
  }
}

module.exports = SmartRandom;
