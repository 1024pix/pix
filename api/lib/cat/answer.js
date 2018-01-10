const AnswerStatus = require('../domain/models/AnswerStatus');

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
    return AnswerStatus.isOK(this.result) ? 1 : 0;
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

module.exports = Answer;
