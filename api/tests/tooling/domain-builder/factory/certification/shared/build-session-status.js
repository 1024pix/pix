import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

/**
 * Fluent builder for the {@link SessionStatus} domain value-object.
 *
 * @example
 * const sessionStatus = domainBuilder.certification.shared
 *   .sessionStatusBuilder()
 *   .isFinalized()
 */
class SessionStatusBuilder {
  constructor() {
    this.status = SESSION_STATUSES.CREATED;
  }

  /**
   * Set the session status as created
   *
   * @returns {SessionStatusBuilder}
   */
  created() {
    this.status = SESSION_STATUSES.CREATED;
    return this;
  }

  /**
   * Set the session status as started
   *
   * @returns {SessionStatusBuilder}
   */
  started() {
    this.status = SESSION_STATUSES.STARTED;
    return this;
  }

  /**
   * Set the session status as to finalize
   *
   * @returns {SessionStatusBuilder}
   */
  toFinalize() {
    this.status = SESSION_STATUSES.TO_FINALIZE;
    return this;
  }

  /**
   * Set the session status as finalized
   *
   * @returns {SessionStatusBuilder}
   */
  finalized() {
    this.status = SESSION_STATUSES.FINALIZED;
    return this;
  }

  /**
   * Set the session status as in process
   *
   * @returns {SessionStatusBuilder}
   */
  inProcess() {
    this.status = SESSION_STATUSES.IN_PROCESS;
    return this;
  }
  /**
   * Set the session status as processed
   *
   * @returns {SessionStatusBuilder}
   */
  processed() {
    this.status = SESSION_STATUSES.PROCESSED;
    return this;
  }

  withParameters({ status = SESSION_STATUSES.CREATED } = {}) {
    this.status = status;
    return this;
  }

  /**
   * Materializes the value object SessionStatus.
   *
   * @returns {SessionStatus}
   */
  build() {
    return new SessionStatus({
      status: this.status,
    });
  }
}

/**
 * Entry point of the fluent SessionStatus builder. Returns the builder, NOT a SessionStatus:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {SessionStatusBuilder}
 */
export function sessionStatusBuilder() {
  return new SessionStatusBuilder();
}
