
const OK = 'ok';
const KO = 'ko';
const SKIPPED = 'aband';
const TIMEDOUT = 'timedout';
const PARTIALLY = 'partially';
const UNIMPLEMENTED = 'unimplemented';

class AnswerStatus {
  constructor({
    // attributes
    status
    // includes
    // references
  } = {}) {
    // attributes
    // TODO: throw a BadAnswerStatus error if the status is bad + adapt the tests
    this.status = status;
    // includes
    // references
  }

  /* PUBLIC INTERFACE */
  isFailed() { return this.status !== OK; }

  isOK() { return this.status === OK; }
  isKO() { return this.status === KO; }
  isSKIPPED() { return this.status === SKIPPED; }
  isTIMEDOUT() { return this.status === TIMEDOUT; }
  isPARTIALLY() { return this.status === PARTIALLY; }
  isUNIMPLEMENTED() { return this.status === UNIMPLEMENTED; }

  /* PUBLIC CONSTRUCTORS */
  static get OK()             { return new AnswerStatus({ status: OK }); }
  static get KO()             { return new AnswerStatus({ status: KO }); }
  static get SKIPPED()        { return new AnswerStatus({ status: SKIPPED }); }
  static get TIMEDOUT()       { return new AnswerStatus({ status: TIMEDOUT }); }
  static get PARTIALLY()      { return new AnswerStatus({ status: PARTIALLY }); }
  static get UNIMPLEMENTED()  { return new AnswerStatus({ status: UNIMPLEMENTED }); }

  /* METHODES DE TRANSITION */
  static isFailed(otherResult) { return AnswerStatus.from(otherResult).isFailed(); }
  static isOK(otherResult)      { return AnswerStatus.from(otherResult).isOK(); }
  static isKO(otherResult)      { return AnswerStatus.from(otherResult).isKO(); }
  static isSKIPPED(otherResult) { return AnswerStatus.from(otherResult).isSKIPPED(); }
  static isPARTIALLY(otherResult) { return AnswerStatus.from(otherResult).isPARTIALLY(); }

  /* PRIVATE */
  static from(other) {
    if (other instanceof AnswerStatus) {
      return other;
    } else {
      return new AnswerStatus({ status: other });
    }
  }
}

module.exports = AnswerStatus;
