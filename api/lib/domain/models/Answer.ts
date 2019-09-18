import AnswerStatus from './AnswerStatus';
import * as _ from 'lodash';

class Answer {
  public id;

  public elapsedTime;
  public result;
  public resultDetails;
  public timeout;
  public value;

  public correction;

  public assessmentId;
  public challengeId;

  // FIXME: DO NOT accept "#ABAND#" as an answer, give this information with a boolean,
  //  and transform it to an AnswerStatus "aband" in the api
  public static FAKE_VALUE_FOR_SKIPPED_QUESTIONS = '#ABAND#';

  constructor({
    id,
    // attributes
    elapsedTime,
    result,
    resultDetails,
    timeout,
    value,
    // includes
    correction,
    // references
    assessmentId,
    challengeId,
  }) {
    this.id = id;
    // attributes
    this.elapsedTime = elapsedTime;
    // XXX result property should not be auto-created from result to an AnswerStatus Object
    this.result = AnswerStatus.from(result);
    this.resultDetails = resultDetails;
    this.timeout = timeout;
    this.value = value;
    // includes
    this.correction = correction;
    // references
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

  get hasTimedOut() {
    return _.isInteger(this.timeout) && this.timeout < 0;
  }

  static filterWithEstimatedLevelGreaterThanZero(assessments) {
    return _(assessments).filter((assessment) => assessment.getLastAssessmentResult().level >= 1).values();
  }
}

export = Answer;
