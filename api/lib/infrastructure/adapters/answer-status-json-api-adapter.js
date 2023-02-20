const UNIMPLEMENTED = 'unimplemented';
const TIMEDOUT = 'timedout';
const FOCUSEDOUT = 'focusedOut';
const PARTIALLY = 'partially';
const SKIPPED = 'aband';
const OK = 'ok';
const KO = 'ko';

const AnswerStatusJsonApiAdapter = {
  adapt(answerStatus) {
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
  },
};

export default AnswerStatusJsonApiAdapter;
