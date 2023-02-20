const OK = 'ok';
const KO = 'ko';
const SKIPPED = 'aband';
const TIMEDOUT = 'timedout';
const FOCUSEDOUT = 'focusedOut';
const PARTIALLY = 'partially';
const UNIMPLEMENTED = 'unimplemented';

class AnswerStatus {
  constructor({ status } = {}) {
    // TODO: throw a BadAnswerStatus error if the status is bad + adapt the tests
    this.status = status;
  }

  /* PUBLIC INTERFACE */
  isFailed() {
    return this.status !== OK;
  }

  isOK() {
    return this.status === OK;
  }
  isKO() {
    return this.status === KO;
  }
  isSKIPPED() {
    return this.status === SKIPPED;
  }
  isTIMEDOUT() {
    return this.status === TIMEDOUT;
  }
  isFOCUSEDOUT() {
    return this.status === FOCUSEDOUT;
  }
  isPARTIALLY() {
    return this.status === PARTIALLY;
  }
  isUNIMPLEMENTED() {
    return this.status === UNIMPLEMENTED;
  }

  /* PUBLIC CONSTRUCTORS */
  static get OK() {
    return new AnswerStatus({ status: OK });
  }
  static get KO() {
    return new AnswerStatus({ status: KO });
  }
  static get SKIPPED() {
    return new AnswerStatus({ status: SKIPPED });
  }
  static get TIMEDOUT() {
    return new AnswerStatus({ status: TIMEDOUT });
  }
  static get FOCUSEDOUT() {
    return new AnswerStatus({ status: FOCUSEDOUT });
  }
  static get PARTIALLY() {
    return new AnswerStatus({ status: PARTIALLY });
  }
  static get UNIMPLEMENTED() {
    return new AnswerStatus({ status: UNIMPLEMENTED });
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

export default AnswerStatus;
