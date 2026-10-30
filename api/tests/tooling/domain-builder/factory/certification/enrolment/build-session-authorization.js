import { SessionAuthorization } from '../../../../../../src/certification/enrolment/domain/models/SessionAuthorization.js';
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
 *   .canEnrollCandidateIndividually()
 *   .withParameters({ id: 456 })
 *   .insertToDB({ databaseBuilder });
 */
class SessionAuthorizationBuilder {
  constructor() {
    this.id = null;
    this.scoIsManagingStudentsOrganizationId = null;
    this.certificationCenterId = null;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
    this.certificationCenterArchived = false;
  }

  /**
   * Can enroll for individual enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  canEnrollCandidateIndividually() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
    return this;
  }

  /**
   * Cannot enroll for individual enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  cannotEnrollCandidateIndividually() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.TO_FINALIZE });
    return this;
  }

  /**
   * Can enroll for sco enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  canEnrollScoCandidate() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
    return this;
  }

  /**
   * Cannot enroll for sco enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  cannotEnrollScoCandidate() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.TO_FINALIZE });
    return this;
  }

  /**
   * Can enroll for mass import enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  canEnrollMassImportCandidate() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
    return this;
  }

  /**
   * Cannot enroll for mass import enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  cannotEnrollMassImportCandidate() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.TO_FINALIZE });
    return this;
  }

  /**
   * Can enroll for ODS import enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  canEnrollODSCandidate() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
    return this;
  }

  /**
   * Cannot enroll for ODS import enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  cannotEnrollODSCandidate() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.TO_FINALIZE });
    return this;
  }

  /**
   * Can join the session
   *
   * @returns {SessionAuthorizationBuilder}
   */
  canJoinSession() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.CREATED });
    return this;
  }

  /**
   * Cannot join the session
   *
   * @returns {SessionAuthorizationBuilder}
   */
  cannotJoinSession() {
    this.certificationCenterArchived = false;
    this.sessionStatus = new SessionStatus({ status: SESSION_STATUSES.TO_FINALIZE });
    return this;
  }

  /**
   * Overrides any subset of the SessionAuthorizationBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted session (id null)   * @returns {SessionAuthorizationBuilder}
   * @returns {SessionAuthorizationBuilder}
   */
  withParameters({
    id,
    scoIsManagingStudentsOrganizationId = null,
    certificationCenterId = null,
    sessionStatus,
    certificationCenterArchived,
  } = {}) {
    this.id = id ?? this.id;
    this.scoIsManagingStudentsOrganizationId = scoIsManagingStudentsOrganizationId;
    this.certificationCenterId = certificationCenterId;
    this.sessionStatus = sessionStatus ? sessionStatus : this.sessionStatus;
    this.certificationCenterArchived = certificationCenterArchived ?? this.certificationCenterArchived;
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
      scoIsManagingStudentsOrganizationId: this.scoIsManagingStudentsOrganizationId,
      certificationCenterId: this.certificationCenterId,
      certificationCenterArchived: this.certificationCenterArchived,
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
