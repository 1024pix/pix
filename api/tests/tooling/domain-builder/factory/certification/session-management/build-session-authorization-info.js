import { SessionAuthorizationInfo } from '../../../../../../src/certification/session-management/domain/read-models/SessionAuthorizationInfo.js';
import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

/**
 * Fluent builder for the {@link SessionAuthorizationInfo} domain read-model.
 *
 * @example
 * const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
 *   .sessionAuthorizationInfoBuilder()
 *   .isFinalized({ at: new Date('2021-01-01') })
 *   .hasExpired()
 *   .withParameters({ id: 456 })
 *   .build()
 */
class SessionAuthorizationInfoBuilder {
  constructor() {
    this.id = null;
    this.hasOrga = false;
    this.scoIsManagingStudentsOrganizationId = null;
    this.certificationCenterId = null;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
  }

  /**
   * Link a matching SCO isManagingStudents organization
   *
   * @param {object} [params]
   * @param {number} [params.organizationId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted organization (id null)
   * @returns {SessionAuthorizationInfoBuilder}
   */
  hasMatchingScoIsManagingStudentsOrganization({ organizationId = null }) {
    this.hasOrga = true;
    this.scoIsManagingStudentsOrganizationId = organizationId;
    return this;
  }

  /**
   * Overrides any subset of the SessionAuthorizationInfoBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted session (id null)
   * @param {number} [params.certificationCenterId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted certification-center (id null)
   * @returns {SessionAuthorizationInfoBuilder}
   */
  withParameters({ id, certificationCenterId = null, sessionStatus } = {}) {
    this.id = id ?? this.id;
    this.certificationCenterId = certificationCenterId;
    this.sessionStatus = sessionStatus ?? this.sessionStatus;
    return this;
  }

  /**
   * Materializes the read-model SessionAuthorizationInfo
   *
   * @returns {SessionAuthorizationInfo}
   */
  build() {
    const organizationId = this.hasOrga ? (this.scoIsManagingStudentsOrganizationId ?? 1) : null;
    return new SessionAuthorizationInfo({
      id: this.id,
      scoIsManagingStudentsOrganizationId: organizationId,
      certificationCenterId: this.certificationCenterId,
      sessionStatus: this.sessionStatus,
    });
  }
}

/**
 * Entry point of the fluent SessionAuthorizationInfo builder. Returns the builder, NOT a SessionAuthorizationInfo:
 * Note: end the chain with build() for in-memory storage
 *
 * @returns {SessionAuthorizationInfoBuilder}
 */
export function sessionAuthorizationInfoBuilder() {
  return new SessionAuthorizationInfoBuilder();
}
