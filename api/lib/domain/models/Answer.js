const AnswerStatus = require('./AnswerStatus');

class Answer {

  constructor({
    id,
    // attributes
    elapsedTime,
    result,
    resultDetails,
    timeout,
    value,

    // relationship Ids
    assessmentId,
    challengeId,
  } = {}) {
    this.id = id;

    this.elapsedTime = elapsedTime;
    this.result = AnswerStatus.from(result);
    this.resultDetails = resultDetails;
    this.timeout = timeout;
    this.value = value;

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

  /**
   * @deprecated Method that does not belong here. Answer has no knowledge of challenge
   * Should maybe belong to challenge ?
   * (Demeter law broken this.challenge.skills.(first-object).difficulty
   */
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
