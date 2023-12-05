import { AnswerStatus } from '../../../shared/domain/models/AnswerStatus.js';

const UNIMPLEMENTED = 'unimplemented';
const TIMEDOUT = 'timedout';
const PARTIALLY = 'partially';
const SKIPPED = 'aband';
const FOCUSEDOUT = 'focusedOut';
const OK = 'ok';
const KO = 'ko';

const adapt = function (answerStatus) {
  return this.toSQLString(answerStatus);
};

const toSQLString = function (answerStatus) {
  if (answerStatus.isOK()) {
    return OK;
  } else if (answerStatus.isKO()) {
    return KO;
  } else if (answerStatus.isSKIPPED()) {
    return SKIPPED;
  } else if (answerStatus.isPARTIALLY()) {
    return PARTIALLY;
  } else if (answerStatus.isTIMEDOUT()) {
    return TIMEDOUT;
  } else if (answerStatus.isFOCUSEDOUT()) {
    return FOCUSEDOUT;
  } else {
    return UNIMPLEMENTED;
  }
};

const fromSQLString = function (answerStatusString) {
  if (answerStatusString === OK) {
    return AnswerStatus.OK;
  } else if (answerStatusString === KO) {
    return AnswerStatus.KO;
  } else if (answerStatusString === PARTIALLY) {
    return AnswerStatus.PARTIALLY;
  } else if (answerStatusString === TIMEDOUT) {
    return AnswerStatus.TIMEDOUT;
  } else if (answerStatusString === SKIPPED) {
    return AnswerStatus.SKIPPED;
  } else if (answerStatusString === FOCUSEDOUT) {
    return AnswerStatus.FOCUSEDOUT;
  } else if (answerStatusString === UNIMPLEMENTED) {
    return AnswerStatus.UNIMPLEMENTED;
  }
};

export { adapt, toSQLString, fromSQLString };
