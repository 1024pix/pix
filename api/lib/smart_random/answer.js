const AnswerStatus = require('../domain/models/AnswerStatus');
const BASE_DIFFICULTY = 2;
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
      // XXX : to avoid problem when challenge has no skill/ when we cannot get challenge
      return BASE_DIFFICULTY;
    }
  }
}

module.exports = Answer;
