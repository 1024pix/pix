class Answer {
  constructor(challenge, result) {
    this.challenge = this._getValidChallenge(challenge);
    this.result = result;
  }
  _getValidChallenge(challenge) {
    return challenge || {
      id: null,
      status: 'archive',
      skills: [],
      timer: null,
    };
  }

  get binaryOutcome() {
    return this.result === 'ok' ? 1 : 0;
  }

  get maxDifficulty() {
    const difficulties = this.challenge.skills.map(skill => skill.difficulty);
    if (difficulties.length > 0) {
      return Math.max(...difficulties);
    } else {
      return 2;
    }
  }
}
Answer.SKIPPED = 'aband';
Answer.OK = 'ok';
Answer.KO = 'ko';

module.exports = Answer;
