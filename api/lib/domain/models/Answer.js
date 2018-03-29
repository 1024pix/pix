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
}

module.exports = Answer;
