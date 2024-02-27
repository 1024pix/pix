const statuses = {
  OK: 'ok',
  KO: 'ko',
  SKIPPED: 'aband',
  TIMEDOUT: 'timedout',
  FOCUSEDOUT: 'focusedOut',
  PARTIALLY: 'partially',
  UNIMPLEMENTED: 'unimplemented',
};

class AnswerStatus {
  constructor({ status } = {}) {
    // TODO: throw a BadAnswerStatus error if the status is bad + adapt the tests
    this.status = status;
  }

  /* PUBLIC INTERFACE */
  isFailed() {
    return this.status !== statuses.OK;
  }

  isOK() {
    return this.status === statuses.OK;
  }
  isKO() {
    return this.status === statuses.KO;
  }
  isSKIPPED() {
    return this.status === statuses.SKIPPED;
  }
  isTIMEDOUT() {
    return this.status === statuses.TIMEDOUT;
  }
  isFOCUSEDOUT() {
    return this.status === statuses.FOCUSEDOUT;
  }
  isPARTIALLY() {
    return this.status === statuses.PARTIALLY;
  }
  isUNIMPLEMENTED() {
    return this.status === statuses.UNIMPLEMENTED;
  }

  /* PUBLIC CONSTRUCTORS */
  static get OK() {
    return new AnswerStatus({ status: statuses.OK });
  }
  static get KO() {
    return new AnswerStatus({ status: statuses.KO });
  }
  static get SKIPPED() {
    return new AnswerStatus({ status: statuses.SKIPPED });
  }
  static get TIMEDOUT() {
    return new AnswerStatus({ status: statuses.TIMEDOUT });
  }
  static get FOCUSEDOUT() {
    return new AnswerStatus({ status: statuses.FOCUSEDOUT });
  }
  static get PARTIALLY() {
    return new AnswerStatus({ status: statuses.PARTIALLY });
  }
  static get UNIMPLEMENTED() {
    return new AnswerStatus({ status: statuses.UNIMPLEMENTED });
  }

  /* METHODES DE TRANSITION */
  static isFailed(otherResult) {
    return AnswerStatus.from(otherResult).isFailed();
  }
  static isOK(otherResult) {
    return AnswerStatus.from(otherResult).isOK();
  }
  static isKO(otherResult) {
    return AnswerStatus.from(otherResult).isKO();
  }
  static isSKIPPED(otherResult) {
    return AnswerStatus.from(otherResult).isSKIPPED();
  }
  static isPARTIALLY(otherResult) {
    return AnswerStatus.from(otherResult).isPARTIALLY();
  }
  static isFOCUSEDOUT(otherResult) {
    return AnswerStatus.from(otherResult).isFOCUSEDOUT();
  }

  /* PRIVATE */
  static from(other) {
    if (other instanceof AnswerStatus) {
      return other;
    } else {
      return new AnswerStatus({ status: other });
    }
  }
}

AnswerStatus.statuses = statuses;

export { AnswerStatus };
