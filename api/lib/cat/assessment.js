const AnswerStatus = require('../domain/models/AnswerStatus');

const MAX_REACHABLE_LEVEL = 5;
const NB_PIX_BY_LEVEL = 8;
const MAX_NUMBER_OF_CHALLENGES = 20;
const LEVEL_FOR_FIRST_CHALLENGE = 2;

class Assessment {
  constructor(course, answers) {
    this.course = course;
    this.answers = answers;
  }

  _randomly()  { return 0.5 - Math.random(); }

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

  _isChallengeNotAnsweredYet(challenge, answeredChallenges) {
    return !answeredChallenges.includes(challenge);
  }

  _isAnAvailableChallenge(challenge) {
    const answeredChallenges = this.answers.map(answer => answer.challenge);
    return challenge.isActive && this._isChallengeNotAnsweredYet(challenge, answeredChallenges);
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
    return challenge.skills.reduce((extraValidatedSkills,skill) => {
      skill.getEasierWithin(this.course.tubes).forEach(skill => {
        if(this._skillNotKnownYet(skill)) {
          extraValidatedSkills.push(skill);
        }
      });
      return extraValidatedSkills;
    }, []);
  }

  _getNewSkillsInfoIfChallengeUnsolved(challenge) {
    return challenge.hardestSkill.getHarderWithin(this.course.tubes)
      .reduce((extraFailedSkills, skill) => {
        if(this._skillNotKnownYet(skill)) {
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

  get validatedSkills() {
    return this.answers
      .filter(answer => AnswerStatus.isOK(answer.result))
      .reduce((skills, answer) => {
        answer.challenge.skills.forEach(skill => {
          skill.getEasierWithin(this.course.tubes).forEach(validatedSkill => {
            if(!skills.includes(validatedSkill))
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
            if(!failedSkills.includes(failedSkill))
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

  get filteredChallenges() {
    let availableChallenges = this.course.challenges.filter(challenge => this._isAnAvailableChallenge(challenge));
    availableChallenges = this._isPreviousChallengeTimed() ? this._extractNotTimedChallenge(availableChallenges) : availableChallenges;
    return availableChallenges;
  }

  get _firstChallenge() {
    const filteredFirstChallenges = this.filteredChallenges.filter(
      challenge => (challenge.hardestSkill.difficulty === LEVEL_FOR_FIRST_CHALLENGE) && (challenge.timer === undefined)
    );
    filteredFirstChallenges.sort(this._randomly);
    return filteredFirstChallenges[0];
  }

  get nextChallenge() {
    if (this.answers.length === 0) {
      return this._firstChallenge;
    }
    if (this.answers.length >= MAX_NUMBER_OF_CHALLENGES) {
      return null;
    }

    const byDescendingRewards = (a, b) => { return b.reward - a.reward; };
    const predictedLevel = this._getPredictedLevel();
    const challengesAndRewards = this.filteredChallenges.map(challenge => {
      return { challenge: challenge, reward: this._computeReward(challenge, predictedLevel) };
    });
    const challengeWithMaxReward = challengesAndRewards.sort(byDescendingRewards)[0];
    const maxReward = challengeWithMaxReward.reward;

    if (maxReward === 0) {
      return null;
    }

    const bestChallenges = challengesAndRewards
      .filter(challengeAndReward => challengeAndReward.reward === maxReward)
      .map(challengeAndReward => challengeAndReward.challenge);
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
