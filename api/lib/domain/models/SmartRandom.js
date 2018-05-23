const Assessment = require('./Assessment');
const Course = require('./Course');
const _ = require('lodash');

const MAX_NUMBER_OF_CHALLENGES = 20;
const LEVEL_FOR_FIRST_CHALLENGE = 2;
const LEVEL_MAX_TO_BE_AN_EASY_TUBE = 3;

function _filterSkillsByChallenges(skills, challenges) {
  const skillsWithChallenges = skills.filter(skill => {
    return challenges.find(challenge => {
      return challenge.skills.find(challengeSkill => skill.name === challengeSkill.name);
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
  const extraAnswers = answers.map(answer => {
    return { binaryOutcome: answer.binaryOutcome, maxDifficulty: answer.maxDifficulty() };
  });

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

  const diffBetweenResultAndProbaToResolve = extraAnswers.map(answer =>
    answer.binaryOutcome - _probaOfCorrectAnswer(level, answer.maxDifficulty));

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
}

function _isChallengeNotAnsweredYet(challenge, answeredChallenges) {
  return !answeredChallenges.includes(challenge);
}

function _skillsToTargetInPriority(courseTubes, validatedSkills, failedSkills) {
  let skillsToTargetInPriority = [];

  for (const tube in courseTubes) {
    const listOfSkillsForThisTube = courseTubes[tube];

    const mostDifficultSkill = listOfSkillsForThisTube.sort((a, b) => a.difficulty < b.difficulty)[0];

    if (mostDifficultSkill.difficulty <= LEVEL_MAX_TO_BE_AN_EASY_TUBE) {

      const nbSkillsNotEvaluated = listOfSkillsForThisTube.filter((skill) => {
        return _skillNotKnownYet(skill, validatedSkills, failedSkills);
      }).length;

      if (nbSkillsNotEvaluated !== 0) {
        skillsToTargetInPriority = skillsToTargetInPriority.concat(courseTubes[tube]);
      }
    }
  }

  return skillsToTargetInPriority;
}

function _isChallengeNotTooHard(challenge, predictedLevel) {
  return challenge.hardestSkill.difficulty - predictedLevel <= 2;
}

function _isAnAvailableChallenge(challenge, answers) {
  const answeredChallenges = answers.map(answer => answer.challenge);
  return challenge.isPublished() && _isChallengeNotAnsweredYet(challenge, answeredChallenges);
}

function _isPreviousChallengeTimed(answers) {
  const answeredChallenges = answers.map(answer => answer.challenge);
  const lastAnswer = answers[answeredChallenges.length - 1];
  if(!lastAnswer || !lastAnswer.challenge) return false;
  return lastAnswer && (lastAnswer.challenge.timer !== undefined);
}

function _extractNotTimedChallenge(availableChallenges) {
  return availableChallenges.filter(challenge => challenge.timer === undefined);
}

function _skillNotKnownYet(skill, validatedSkills, failedSkills) {
  return !validatedSkills.includes(skill) && !failedSkills.includes(skill);
}

function _filteredChallenges(challenges, answers, tubes, validatedSkills, failedSkills, predictedLevel) {
  let availableChallenges = challenges.filter(challenge => _isAnAvailableChallenge(challenge, answers));

  if (_isPreviousChallengeTimed(answers)) {
    availableChallenges = _extractNotTimedChallenge(availableChallenges);
  }

  availableChallenges = availableChallenges.filter(challenge => _isChallengeNotTooHard(challenge, predictedLevel));

  const listOfSkillsToTargetInPriority = _skillsToTargetInPriority(tubes, validatedSkills, failedSkills);
  if (listOfSkillsToTargetInPriority.length > 0) {
    availableChallenges = _filterChallengesBySkills(availableChallenges, listOfSkillsToTargetInPriority);
  }

  return availableChallenges;
}

function _filterChallengesBySkills(listOfChallenges, listOfRequiredSkills) {
  return listOfChallenges.filter((challenge) => {

    let challengeContainsTargetedSkill = false;

    listOfRequiredSkills.map((skill) => skill.name).forEach((skillName) => {
      const challengeHasSkill = challenge.skills.map((skill) => skill.name).includes(skillName);
      if (challengeHasSkill) {
        challengeContainsTargetedSkill = true;
      }
    });

    return challengeContainsTargetedSkill;
  });
}

function _getNewSkillsInfoIfChallengeSolved(challenge, tubes, validatedSkills, failedSkills) {
  return challenge.skills.reduce((extraValidatedSkills, skill) => {
    skill.getEasierWithin(tubes).forEach(skill => {
      if (_skillNotKnownYet(skill, validatedSkills, failedSkills)) {
        extraValidatedSkills.push(skill);
      }
    });
    return extraValidatedSkills;
  }, []);
}

function _getNewSkillsInfoIfChallengeUnsolved(challenge, tubes, validatedSkills, failedSkills) {
  return challenge.hardestSkill.getHarderWithin(tubes)
    .reduce((extraFailedSkills, skill) => {
      if (_skillNotKnownYet(skill, validatedSkills, failedSkills)) {
        extraFailedSkills.push(skill);
      }
      return extraFailedSkills;
    }, []);
}

function _computeReward(challenge, predictedLevel, tubes, validatedSkills, failedSkills) {
  const proba = _probaOfCorrectAnswer(predictedLevel, challenge.hardestSkill.difficulty);
  const nbExtraSkillsIfSolved = _getNewSkillsInfoIfChallengeSolved(challenge, tubes, validatedSkills, failedSkills).length;
  const nbFailedSkillsIfUnsolved = _getNewSkillsInfoIfChallengeUnsolved(challenge, tubes, validatedSkills, failedSkills).length;

  return proba * nbExtraSkillsIfSolved + (1 - proba) * nbFailedSkillsIfUnsolved;
}

function _firstChallenge(challenges, answers, tubes, validatedSkills, failedSkills, predictedLevel) {
  const filteredFirstChallenges = _filteredChallenges(challenges, answers, tubes, validatedSkills, failedSkills, predictedLevel).filter(
    challenge => (challenge.hardestSkill.difficulty === LEVEL_FOR_FIRST_CHALLENGE) && (challenge.timer === undefined)
  );
  filteredFirstChallenges.sort(_randomly);
  return filteredFirstChallenges[0];
}

class SmartRandom {

  constructor(answers, challenges, skills) {
    this.challenges = challenges;
    this.skills = skills;

    this.course = new Course();
    const listSkillsWithChallenges = _filterSkillsByChallenges(skills, challenges);
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

    if (this.answers.length >= MAX_NUMBER_OF_CHALLENGES) {
      return null;
    }

    const availableChallenges = _filteredChallenges(
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
    const challengesAndRewards = availableChallenges.map(challenge => {
      return {
        challenge: challenge,
        reward: _computeReward(
          challenge,
          predictedLevel,
          this.course.tubes,
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
      .filter(challengeAndReward => challengeAndReward.reward === maxReward)
      .map(challengeAndReward => challengeAndReward.challenge);
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

  get testedSkills() {
    return _.union(this.validatedSkills, this.failedSkills);
  }

  getPredictedLevel() {
    if (this.answers.length === 0) {
      return LEVEL_FOR_FIRST_CHALLENGE;
    }
    let maxLikelihood = -Infinity;
    let level = 0.5;
    let predictedLevel = 0.5;
    // XXX : Question : why 8  when max level is 5 ?
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
}

module.exports = SmartRandom;

