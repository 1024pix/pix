import { AnswerStatus } from '../../../../src/school/domain/models/AnswerStatus.js';
import _ from 'lodash';

class Answer {
  constructor({
    id,
    result,
    resultDetails,
    timeout,
    isFocusedOut,
    value,
    levelup,
    assessmentId,
    challengeId,
    timeSpent,
  } = {}) {
    this.id = id;
    // XXX result property should not be auto-created from result to an AnswerStatus Object
    this.result = AnswerStatus.from(result);
    this.resultDetails = resultDetails;
    this.timeout = timeout;
    this.isFocusedOut = isFocusedOut || this.result.isFOCUSEDOUT();
    this.value = value;
    this.levelup = levelup;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
    this.timeSpent = timeSpent;
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
      const difficulties = this.challenge.skills.map((skill) => skill.difficulty);
      if (difficulties.length > 0) {
        return Math.max(...difficulties);
      }
    }
    // XXX : to avoid problem when challenge has no skill/ when we cannot get challenge
    return baseDifficulty;
  }

  get hasTimedOut() {
    return _.isInteger(this.timeout) && this.timeout < 0;
  }

  setTimeSpentFrom({ now, lastQuestionDate }) {
    this.timeSpent = Math.ceil((now.getTime() - lastQuestionDate.getTime()) / 1000);
  }
}

// FIXME: DO NOT accept "#ABAND#" as an answer, give this information with a boolean,
//  and transform it to an AnswerStatus "aband" in the api
Answer.FAKE_VALUE_FOR_SKIPPED_QUESTIONS = '#ABAND#';

export { Answer };
