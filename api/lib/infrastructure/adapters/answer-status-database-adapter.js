const AnswerStatus = require('../../domain/models/AnswerStatus');

const UNIMPLEMENTED = 'unimplemented';
const TIMEDOUT = 'timedout';
const PARTIALLY = 'partially';
const SKIPPED = 'aband';
const OK = 'ok';
const KO = 'ko';

module.exports = {

  /**
   * @deprecated use toSQLString instead
   */
  adapt(answerStatus) {

    return this.toSQLString(answerStatus);
  },

  toSQLString(answerStatus) {
    if(answerStatus instanceof AnswerStatus) {

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
      } else {
        return UNIMPLEMENTED;
      }
    }
    return answerStatus;
  },

  fromSQLString(answerStatusString) {

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
    } else if (answerStatusString === UNIMPLEMENTED) {
      return AnswerStatus.UNIMPLEMENTED;
    }
  },
};

