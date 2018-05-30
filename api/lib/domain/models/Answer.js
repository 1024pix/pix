const AnswerStatus = require('./AnswerStatus');

class Answer {

  constructor({ id, value, result, timeout, elapsedTime, resultDetails, assessmentId, challengeId } = {}) {
    this.id = id;
    this.value = value;
    this.result = AnswerStatus.from(result);
    this.timeout = timeout;
    this.elapsedTime = elapsedTime;
    this.resultDetails = resultDetails;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
  }

  isOk() {
    return this.result.isOK();
  }

  isPartially() {
    return this.result.isPARTIALLY();
  }

  get binaryOutcome() {
    return AnswerStatus.isOK(this.result) ? 1 : 0;
  }

  maxDifficulty(baseDifficulty = 2) {
    if (this.challenge) {
      const difficulties = this.challenge.skills.map(skill => skill.difficulty);
      if (difficulties.length > 0) {
        return Math.max(...difficulties);
      }
    }
    // XXX : to avoid problem when challenge has no skill/ when we cannot get challenge
    return baseDifficulty;
  }
}

module.exports = Answer;
