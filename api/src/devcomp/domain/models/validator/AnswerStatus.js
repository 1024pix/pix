const OK = 'ok';
const KO = 'ko';
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

  /* PRIVATE */
  static from(other) {
    if (other instanceof AnswerStatus) {
      return other;
    } else {
      return new AnswerStatus({ status: other });
    }
  }
}

export { AnswerStatus };
