import { SessionAuthorizationInfo } from '../../../../../../src/certification/session-management/domain/models/SessionAuthorizationInfo.js';
import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

/**
 * Fluent builder for the {@link SessionAuthorizationInfo} domain model.
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
    this.id = 1;
    this.scoIsManagingStudentsOrganizationId = null;
    this.certificationCenterId = 3;
    this.invigilatorPassword = 'FOO';
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
    this.certificationCenterArchived = false;
  }

  /**
   * Link a matching SCO isManagingStudents organization
   *
   * @param {object} [params]
   * @param {number} [params.organizationId]
   * @returns {SessionAuthorizationInfoBuilder}
   */
  hasMatchingScoIsManagingStudentsOrganization({ organizationId }) {
    this.scoIsManagingStudentsOrganizationId = organizationId;
    return this;
  }

  /**
   * Set the certification center as archived
   *
   * @returns {SessionAuthorizationInfoBuilder}
   */
  certificationCenterIsArchived() {
    this.certificationCenterArchived = true;
    return this;
  }

  /**
   * Set the certification center as NOT archived
   *
   * @returns {SessionAuthorizationInfoBuilder}
   */
  certificationCenterIsNotArchived() {
    this.certificationCenterArchived = false;
    return this;
  }

  /**
   * Overrides any subset of the SessionAuthorizationInfoBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id]
   * @param {number} [params.certificationCenterId]
   * @param {number} [params.scoIsManagingStudentsOrganizationId]
   * @param {string} [params.invigilatorPassword]
   * @param {boolean} [params.certificationCenterArchived]
   * @returns {SessionAuthorizationInfoBuilder}
   */
  withParameters({
    id,
    invigilatorPassword,
    certificationCenterId,
    scoIsManagingStudentsOrganizationId,
    sessionStatus,
    certificationCenterArchived,
  } = {}) {
    this.id = id ?? this.id;
    this.certificationCenterId = certificationCenterId ?? this.certificationCenterId;
    this.scoIsManagingStudentsOrganizationId =
      scoIsManagingStudentsOrganizationId ?? this.scoIsManagingStudentsOrganizationId;
    this.invigilatorPassword = invigilatorPassword ?? this.invigilatorPassword;
    this.sessionStatus = sessionStatus ?? this.sessionStatus;
    this.certificationCenterArchived = certificationCenterArchived ?? this.certificationCenterArchived;
    return this;
  }

  /**
   * Materializes the model SessionAuthorizationInfo
   *
   * @returns {SessionAuthorizationInfo}
   */
  build() {
    return new SessionAuthorizationInfo({
      id: this.id,
      scoIsManagingStudentsOrganizationId: this.scoIsManagingStudentsOrganizationId,
      certificationCenterId: this.certificationCenterId,
      invigilatorPassword: this.invigilatorPassword,
      sessionStatus: this.sessionStatus,
      certificationCenterArchived: this.certificationCenterArchived,
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
