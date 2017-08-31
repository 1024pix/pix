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
        answer.challenge.hardestSkill.getHarderWithin(this.course.tubes).forEach(failedSkill => {
          failedSkills.add(failedSkill);
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
    const answeredChallenges = this.answers.map(answer => answer.challenge);
    return this.course.challenges.filter(challenge => !answeredChallenges.includes(challenge) && ['validé', 'validé sans test', 'pré-validé'].includes(challenge.status));
  }

  get nextChallenge() {
    if (this.answers.length == 20) {
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
    if (maxReward == 0) { // We will not get extra information
      return null;
    } else {
      return bestChallenge; // May be undefined, in which case the adaptive test should be ended
    }
  }
}

module.exports = Assessment;
