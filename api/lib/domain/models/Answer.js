const AnswerStatus = require('./AnswerStatus');

class Answer {

  constructor(model = {}) {
    this.id = model.id;
    this.value = model.value;
    this.result = AnswerStatus.from(model.result);
    this.timeout = model.timeout;
    this.elapsedTime = model.elapsedTime;
    this.resultDetails = model.resultDetails;

    // TODO create real relations
    this.assessmentId = model.assessmentId;
    this.challengeId = model.challengeId;
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

  maxDifficulty(baseDifficulty) {
    if (this.challengeObject) {
      const difficulties = this.challengeObject.skills.map(skill => skill.difficulty);
      if (difficulties.length > 0) {
        return Math.max(...difficulties);
      }
    }
    // XXX : to avoid problem when challenge has no skill/ when we cannot get challenge
    return baseDifficulty;
  }
}

module.exports = Answer;
