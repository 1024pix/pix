import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

/**
 * Fluent builder for the {@link SessionAuthorization} domain model.
 *
 * @example
 * const sessionAuthorization = domainBuilder.certification.sessionManagement
 *   .sessionAuthorizationBuilder()
 *   .withParameters({ id: 456 })
 *   .insertToDB({ databaseBuilder });
 */
class SessionAuthorizationBuilder {
  constructor() {
    this.id = null;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
  }

  withParameters({ id, sessionStatus } = {}) {
    this.id = id ?? this.id;
    this.sessionStatus = sessionStatus ? sessionStatus : this.sessionStatus;
    return this;
  }

  /**
   * Materializes the read-model SessionAuthorization.
   *
   * @returns {SessionAuthorization}
   */
  build() {
    return new SessionAuthorization({
      id: this.id,
      sessionStatus: this.sessionStatus,
    });
  }
}

/**
 * Entry point of the fluent SessionAuthorization builder. Returns the builder, NOT a SessionAuthorization:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {SessionAuthorizationBuilder}
 */
export function sessionAuthorizationBuilder() {
  return new SessionAuthorizationBuilder();
}
