const Assessment = require('./Assessment');
const Course = require('./Course');
const _ = require('lodash');

const MAX_NUMBER_OF_CHALLENGES = 5;
const LEVEL_FOR_FIRST_CHALLENGE = 2;
const LEVEL_MAX_TO_BE_AN_EASY_TUBE = 3;

class SmartRandom {

  constructor(answers, challenges, skills) {
    this.challenges = challenges;
    this.skills = skills;

    this.course = new Course();
    this.course.competenceSkills = skills;
    this.course.computeTubes(skills);

    this.assessment = new Assessment();
    this.assessment.addAnswersWithTheirChallenge(answers, challenges);
    this.assessment.course = this.course;

    this.answers = this.assessment.answers;
  }

  getNextChallenge() {

    if (this.answers.length === 0) {
      return this._firstChallenge();
    }

    if (this.answers.length >= MAX_NUMBER_OF_CHALLENGES) {
      return null;
    }

    const availableChallenges = this._filteredChallenges();
    if (availableChallenges.length === 0) {
      return null;
    }

    const predictedLevel = this.getPredictedLevel();
    const challengesAndRewards = availableChallenges.map(challenge => {
      return {
        challenge: challenge,
        reward: this._computeReward(challenge, predictedLevel)
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
    return bestChallenges.sort(this._randomly)[0];
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
    return _.union(this.valitatedSkills, this.rejectedSkills);
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
      const likelihood = this._computeLikelihood(level, this.answers);
      if (likelihood > maxLikelihood) {
        maxLikelihood = likelihood;
        predictedLevel = level;
      }
      level += 0.5;
    }
    return predictedLevel;
  }

  _randomly() {
    return 0.5 - Math.random();
  }

  _probaOfCorrectAnswer(level, difficulty) {
    return 1 / (1 + Math.exp(-(level - difficulty)));
  }

  _computeLikelihood(level, answers) {
    const extraAnswers = answers.map(answer => {
      return { binaryOutcome: answer.binaryOutcome, maxDifficulty: answer.maxDifficulty() };
    });

    const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
    const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
    extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

    const diffBetweenResultAndProbaToResolve = extraAnswers.map(answer =>
      answer.binaryOutcome - this._probaOfCorrectAnswer(level, answer.maxDifficulty));

    return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
  }

  _isChallengeNotAnsweredYet(challenge, answeredChallenges) {
    return !answeredChallenges.includes(challenge);
  }

  _isChallengeNotTooHard(challenge) {
    return challenge.hardestSkill.difficulty - this.getPredictedLevel() <= 2;
  }

  _isAnAvailableChallenge(challenge) {
    const answeredChallenges = this.answers.map(answer => answer.challenge);
    return challenge.isPublished() && this._isChallengeNotAnsweredYet(challenge, answeredChallenges);
  }

  _isPreviousChallengeTimed() {
    const answeredChallenges = this.answers.map(answer => answer.challenge);
    const lastAnswer = this.answers[answeredChallenges.length - 1];
    if(!lastAnswer || !lastAnswer.challenge) return false;
    return lastAnswer && (lastAnswer.challenge.timer !== undefined);
  }

  _extractNotTimedChallenge(availableChallenges) {
    return availableChallenges.filter(challenge => challenge.timer === undefined);
  }

  _skillNotKnownYet(skill) {
    return !this.validatedSkills.includes(skill) && !this.failedSkills.includes(skill);
  }

  _filteredChallenges() {
    let availableChallenges = this.challenges.filter(challenge => this._isAnAvailableChallenge(challenge));

    if (this._isPreviousChallengeTimed()) {
      availableChallenges = this._extractNotTimedChallenge(availableChallenges);
    }

    availableChallenges = availableChallenges.filter(challenge => this._isChallengeNotTooHard(challenge));

    const listOfSkillsToTargetInPriority = this._skillsToTargetInPriority();
    if (listOfSkillsToTargetInPriority.length > 0) {
      availableChallenges = this._filterChallengesBySkills(availableChallenges, listOfSkillsToTargetInPriority);
    }

    return availableChallenges;
  }

  _filterChallengesBySkills(listOfChallenges, listOfRequiredSkills) {
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

  _getNewSkillsInfoIfChallengeSolved(challenge) {
    return challenge.skills.reduce((extraValidatedSkills, skill) => {
      skill.getEasierWithin(this.course.tubes).forEach(skill => {
        if (this._skillNotKnownYet(skill)) {
          extraValidatedSkills.push(skill);
        }
      });
      return extraValidatedSkills;
    }, []);
  }

  _getNewSkillsInfoIfChallengeUnsolved(challenge) {
    return challenge.hardestSkill.getHarderWithin(this.course.tubes)
      .reduce((extraFailedSkills, skill) => {
        if (this._skillNotKnownYet(skill)) {
          extraFailedSkills.push(skill);
        }
        return extraFailedSkills;
      }, []);
  }

  _computeReward(challenge, predictedLevel) {
    const proba = this._probaOfCorrectAnswer(predictedLevel, challenge.hardestSkill.difficulty);
    const nbExtraSkillsIfSolved = this._getNewSkillsInfoIfChallengeSolved(challenge).length;
    const nbFailedSkillsIfUnsolved = this._getNewSkillsInfoIfChallengeUnsolved(challenge).length;

    return proba * nbExtraSkillsIfSolved + (1 - proba) * nbFailedSkillsIfUnsolved;
  }

  _skillsToTargetInPriority() {
    const courseTubes = this.course.tubes;
    let skillsToTargetInPriority = [];

    for (const tube in courseTubes) {
      const listOfSkillsForThisTube = courseTubes[tube];

      const mostDifficultSkill = listOfSkillsForThisTube.sort((a, b) => a.difficulty < b.difficulty)[0];

      if (mostDifficultSkill.difficulty <= LEVEL_MAX_TO_BE_AN_EASY_TUBE) {

        const nbSkillsNotEvaluated = listOfSkillsForThisTube.filter((skill) => {
          return this._skillNotKnownYet(skill);
        }).length;

        if (nbSkillsNotEvaluated !== 0) {
          skillsToTargetInPriority = skillsToTargetInPriority.concat(courseTubes[tube]);
        }
      }
    }

    return skillsToTargetInPriority;
  }

  _firstChallenge() {
    const filteredFirstChallenges = this._filteredChallenges().filter(
      challenge => (challenge.hardestSkill.difficulty === LEVEL_FOR_FIRST_CHALLENGE) && (challenge.timer === undefined)
    );
    filteredFirstChallenges.sort(this._randomly);
    return filteredFirstChallenges[0];
  }

}

module.exports = SmartRandom;

