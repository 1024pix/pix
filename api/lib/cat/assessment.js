Set.prototype.union = function(setB) {
  const union = new Set(this);
  for (const elem of setB) {
    union.add(elem);
  }
  return union;
};

Set.prototype.difference = function(setB) {
  const difference = new Set(this);

  for (const elem of setB) {
    difference.delete(elem);
  }

  return difference;
};

const MAX_REACHABLE_LEVEL = 5;
const NB_PIX_BY_LEVEL = 8;

class Assessment {
  constructor(course, answers) {
    this.course = course;
    this.answers = answers;
  }

  get validatedSkills() {
    return this.answers
      .filter(answer => answer.result === 'ok')
      .reduce((skills, answer) => {
        answer.challenge.skills.forEach(skill => {
          skill.getEasierWithin(this.course.tubes).forEach(validatedSkill => {
            skills.add(validatedSkill);
          });
        });
        return skills;
      }, new Set());
  }

  get failedSkills() {
    return this.answers
      .filter(answer => answer.result !== 'ok')
      .reduce((failedSkills, answer) => {
        // FIXME refactor !
        // XXX we take the current failed skill and all the harder skills in
        // its tube and mark them all as failed
        answer.challenge.skills.forEach(skill => {
          skill.getHarderWithin(this.course.tubes).forEach(failedSkill => {
            failedSkills.add(failedSkill);
          });
        });
        return failedSkills;
      }, new Set());
  }

  _probaOfCorrectAnswer(level, difficulty) {
    return 1 / (1 + Math.exp(-(level - difficulty)));
  }

  _computeLikelihood(level, answers) {
    return -Math.abs(answers.map(answer => answer.binaryOutcome - this._probaOfCorrectAnswer(level, answer.maxDifficulty)).reduce((a, b) => a + b));
  }

  _isAnActiveChallenge(challenge) {
    const unactiveChallengeStatus = ['validé', 'validé sans test', 'pré-validé'];
    return unactiveChallengeStatus.includes(challenge.status);
  }

  _isAnAnsweredChallenge(challenge, answeredChallenges) {
    return !answeredChallenges.includes(challenge);
  }

  _isAnAvailableChallenge(challenge) {
    const answeredChallenges = this.answers.map(answer => answer.challenge);
    return this._isAnActiveChallenge(challenge) && this._isAnAnsweredChallenge(challenge, answeredChallenges);
  }

  _isPreviousChallengeTimed() {
    const answeredChallenges = this.answers.map(answer => answer.challenge);
    const lastAnswer = this.answers[answeredChallenges.length - 1];
    return lastAnswer && lastAnswer.challenge.timer !== undefined;
  }

  _extractNotTimedChallenge(availableChallenges) {
    return availableChallenges.filter(challenge => challenge.timer === undefined);
  }

  get estimatedLevel() {
    if (this.answers.length === 0) {
      return 2;
    }
    let maxLikelihood = -Infinity;
    let level = 0.5;
    let estimatedLevel = 0.5;
    while (level < 8) {
      const likelihood = this._computeLikelihood(level, this.answers);
      if (likelihood > maxLikelihood) {
        maxLikelihood = likelihood;
        estimatedLevel = level;
      }
      level += 0.5;
    }
    return estimatedLevel;
  }

  _extraValidatedSkillsIfSolved(challenge) {
    let extraValidatedSkills = new Set();
    challenge.skills.forEach(skill => {
      extraValidatedSkills = extraValidatedSkills.union(skill.getEasierWithin(this.course.tubes));
    });
    return extraValidatedSkills.difference(this.validatedSkills).difference(this.failedSkills);
  }

  _extraFailedSkillsIfUnsolved(challenge) {
    const extraFailedSkills = new Set(challenge.hardestSkill.getHarderWithin(this.course.tubes));
    return extraFailedSkills.difference(this.validatedSkills).difference(this.failedSkills);
  }

  _computeReward(challenge) {
    const proba = this._probaOfCorrectAnswer(this.estimatedLevel, challenge.hardestSkill.difficulty);
    const nbExtraSkillsIfSolved = this._extraValidatedSkillsIfSolved(challenge).size;
    const nbFailedSkillsIfUnsolved = this._extraFailedSkillsIfUnsolved(challenge).size;
    return proba * nbExtraSkillsIfSolved + (1 - proba) * nbFailedSkillsIfUnsolved;
  }

  get filteredChallenges() {
    let availableChallenges = this.course.challenges.filter(challenge => this._isAnAvailableChallenge(challenge));
    availableChallenges = this._isPreviousChallengeTimed() ? this._extractNotTimedChallenge(availableChallenges) : availableChallenges;
    return availableChallenges;
  }

  get _firstChallenge() {
    const filteredFirstChallenges = this.filteredChallenges.filter(
      challenge => (challenge.hardestSkill.difficulty === 2) && (challenge.timer === undefined)
    );
    filteredFirstChallenges.sort(() => 0.5 - Math.random());
    return filteredFirstChallenges[0];
  }

  get nextChallenge() {
    if (this.answers.length === 0) {
      return this._firstChallenge;
    }
    if (this.answers.length >= 20) {
      return null;
    }
    const filteredChallenges = this.filteredChallenges;
    let bestChallenge = filteredChallenges[0];
    let maxReward = 0;
    filteredChallenges.forEach(challenge => {
      const reward = this._computeReward(challenge);
      if (reward > maxReward) {
        maxReward = reward;
        bestChallenge = challenge;
      }
    });
    if (maxReward === 0) { // We will not get extra information
      return null;
    } else {
      return bestChallenge; // May be undefined, in which case the adaptive test should be ended
    }
  }

  get pixScore() {
    const pixScoreOfSkills = this.course.computePixScoreOfSkills();
    return [...this.validatedSkills]
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
