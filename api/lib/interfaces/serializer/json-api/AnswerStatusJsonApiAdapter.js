
class AnswerStatusJsonApiAdapter {
  static adapt(answerStatus) {
    const UNIMPLEMENTED = 'unimplemented';
    const TIMEDOUT = 'timedout';
    const PARTIALLY = 'partially';
    const SKIPPED = 'aband';
    const OK = 'ok';
    const KO = 'ko';

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
}

module.exports = AnswerStatusJsonApiAdapter;
