const AnswerStatus = require('../domain/models/AnswerStatus');
const _ = require('lodash');
const logger = require('../infrastructure/logger');

const MAX_REACHABLE_LEVEL = 5;
const NB_PIX_BY_LEVEL = 8;
const MAX_NUMBER_OF_CHALLENGES = 20;
const LEVEL_FOR_FIRST_CHALLENGE = 2;
const LEVEL_MAX_TO_BE_AN_EASY_TUBE = 3;

class Assessment {
  constructor(course, answers) {
    this.course = course;
    this.answers = answers;
  }

  _randomly() {
    return 0.5 - Math.random();
  }

  _probaOfCorrectAnswer(level, difficulty) {
    return 1 / (1 + Math.exp(-(level - difficulty)));
  }

  _computeLikelihood(level, answers) {
    const extraAnswers = answers.map(answer => {
      return { binaryOutcome: answer.binaryOutcome, maxDifficulty: answer.maxDifficulty };
    });

    const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
    const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
    extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

    const diffBetweenResultAndProbaToResolve = extraAnswers.map(answer =>
      answer.binaryOutcome - this._probaOfCorrectAnswer(level, answer.maxDifficulty));

    return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
  }

  _isChallengeNotTooHard(challenge) {
    return challenge.hardestSkill.difficulty - this._getPredictedLevel() <= 2;
  }

  _isAnAvailableChallenge(challenge) {
    return challenge.isActive && challenge.testsAtLeastOneNewSkill(this.assessedSkills);
  }

  _isPreviousChallengeTimed() {
    const answeredChallenges = this.answers.map(answer => answer.challenge);
    const lastAnswer = this.answers[answeredChallenges.length - 1];
    return lastAnswer && lastAnswer.challenge.timer !== undefined;
  }

  _extractNotTimedChallenge(availableChallenges) {
    return availableChallenges.filter(challenge => challenge.timer === undefined);
  }

  _skillNotKnownYet(skill) {
    return !this.validatedSkills.includes(skill) && !this.failedSkills.includes(skill);
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

  get assessedSkills() {
    return _.union(this.validatedSkills, this.failedSkills);
  }

  get validatedSkills() {
    return this.answers
      .filter(answer => AnswerStatus.isOK(answer.result))
      .reduce((skills, answer) => {
        answer.challenge.skills.forEach(skill => {
          skill.getEasierWithin(this.course.tubes).forEach(validatedSkill => {
            if (!skills.includes(validatedSkill))
              skills.push(validatedSkill);
          });
        });
        return skills;
      }, []);
  }

  get failedSkills() {
    return this.answers
      .filter(answer => AnswerStatus.isFailed(answer.result))
      .reduce((failedSkills, answer) => {
        // FIXME refactor !
        // XXX we take the current failed skill and all the harder skills in
        // its tube and mark them all as failed
        answer.challenge.skills.forEach(skill => {
          skill.getHarderWithin(this.course.tubes).forEach(failedSkill => {
            if (!failedSkills.includes(failedSkill))
              failedSkills.push(failedSkill);
          });
        });
        return failedSkills;
      }, []);
  }

  _getPredictedLevel() {
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

  get filteredChallenges() {
    let availableChallenges = this.course.challenges.filter(challenge => this._isAnAvailableChallenge(challenge));

    if (this._isPreviousChallengeTimed()) {
      availableChallenges = this._extractNotTimedChallenge(availableChallenges);
    }

    availableChallenges = availableChallenges.filter(challenge => this._isChallengeNotTooHard(challenge));

    const listOfSkillsToTargetInPriority = this._skillsToTargetInPriority();
    const thereAreSkillsToTargetInPriority = listOfSkillsToTargetInPriority.length > 0;
    const itIsTheFirstChallenge = this.answers.length > 0;

    if (thereAreSkillsToTargetInPriority && itIsTheFirstChallenge) {
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

  get _firstChallenge() {
    const filteredFirstChallenges = this.filteredChallenges.filter(
      challenge => (challenge.hardestSkill.difficulty === LEVEL_FOR_FIRST_CHALLENGE) && (challenge.timer === undefined)
    );
    filteredFirstChallenges.sort(this._randomly);
    return filteredFirstChallenges[0];
  }

  get nextChallenge() {
    const logContext = {
      zone: 'CatAsessment.nextChallenge',
      type: 'cat',
      answers: this.answers.map(answer => {
        const challenge = answer.challenge || { id: null };
        const skills = (challenge.skills || []).map(skill => skill.name);
        return {
          challengeId: challenge.id,
          result: answer.result,
          skills,
        };
      }),
      courseId: this.course.id,
    };
    logger.trace(logContext, 'looking for next challenge in CAT Assessment');

    if (this.answers.length === 0) {
      logger.trace(logContext, 'no answer, return first challenge');
      return this._firstChallenge;
    }

    if (this.answers.length >= MAX_NUMBER_OF_CHALLENGES) {
      logger.trace(logContext, 'max answers for assessment reached. End of assessment.');
      return null;
    }

    const availableChallenges = this.filteredChallenges;
    if (availableChallenges.length === 0) {
      logger.trace(logContext, 'no more available challenges. End of Assessment.');
      return null;
    }

    const predictedLevel = this._getPredictedLevel();
    const challengesAndRewards = availableChallenges.map(challenge => {
      return {
        challenge: challenge,
        reward: this._computeReward(challenge, predictedLevel)
      };
    });

    const challengeWithMaxReward = _.maxBy(challengesAndRewards, 'reward');
    const maxReward = challengeWithMaxReward.reward;
    logContext.challengeWithMaxReward = challengeWithMaxReward.id;
    logContext.maxReward = maxReward;
    logContext.predictedLevel = predictedLevel;

    if (maxReward === 0) {
      logger.trace(logContext, 'maxReward is 0, nothing more to ask. End of assessment.');
      return null;
    }

    const bestChallenges = challengesAndRewards
      .filter(challengeAndReward => challengeAndReward.reward === maxReward)
      .map(challengeAndReward => challengeAndReward.challenge);

    logContext.bestChallenges = bestChallenges.map(challenge => challenge.id);
    logger.trace(logContext, 'best challenges selected. Choosing one randomly.');
    return bestChallenges.sort(this._randomly)[0];
  }

  get pixScore() {
    const pixScoreOfSkills = this.course.computePixScoreOfSkills();
    return this.validatedSkills
      .map(skill => pixScoreOfSkills[skill.name] || 0)
      .reduce((a, b) => a + b, 0);
  }

  get displayedPixScore() {
    return Math.floor(this.pixScore);
  }

  get obtainedLevel() {
    const estimatedLevel = Math.floor(this.pixScore / NB_PIX_BY_LEVEL);
    return (estimatedLevel >= MAX_REACHABLE_LEVEL) ? MAX_REACHABLE_LEVEL : estimatedLevel;
  }
}

module.exports = Assessment;
