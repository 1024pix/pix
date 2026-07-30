import { databaseBuffer } from '../../../../../../db/database-builder/database-buffer.js';
import { SessionAuthorizationInfo } from '../../../../../../src/certification/session-management/domain/read-models/SessionAuthorizationInfo.js';

/**
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link SessionAuthorizationInfo} domain read-model.
 *
 * @example
 * const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
 *   .sessionAuthorizationInfoBuilder()
 *   .isFinalized({ at: new Date('2021-01-01') })
 *   .hasExpired()
 *   .withParameters({ id: 456 })
 *   .insertToDB({ databaseBuilder });
 */
class SessionAuthorizationInfoBuilder {
  constructor() {
    this.id = null;
    this.finalizedAt = null;
    this.firstCertificationStartedAt = null;
    this.hasOrga = false;
    this.scoIsManagingStudentsOrganizationId = null;
    this.certificationCenterId = null;
  }

  /**
   * Set the session as finalized
   *
   * @param {object} [params]
   * @param {Date} [params.at]
   * @returns {SessionAuthorizationInfoBuilder}
   */
  isFinalized({ at = new Date() } = {}) {
    this.finalizedAt = at;
    return this;
  }

  /**
   * Set the date of the first certification test
   *
   * @param {object} [params]
   * @param {Date} [params.at]
   * @returns {SessionAuthorizationInfoBuilder}
   */
  withFirstCertificationStarted({ at = new Date() } = {}) {
    this.firstCertificationStartedAt = at;
    return this;
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
  withParameters({ id, certificationCenterId = null } = {}) {
    this.id = id ?? this.id;
    this.certificationCenterId = certificationCenterId;
    return this;
  }

  /**
   * Inserts corresponding session row and all the underlying necessary data
   * then returns the built domain SessionAuthorizationInfo carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {SessionAuthorizationInfo} the persisted sessionAuthorizationInfo
   */
  insertToDB({ databaseBuilder }) {
    const sessionAuthorizationInfo = this.build();
    const type = this.hasOrga ? 'SCO' : 'PRO';
    const certificationCenterId = sessionAuthorizationInfo.certificationCenterId ?? databaseBuffer.getNextId();
    sessionAuthorizationInfo.certificationCenterId = certificationCenterId;
    const externalId = `EXTERNAL_ID_${certificationCenterId}`;
    databaseBuilder.factory.buildCertificationCenter({
      id: certificationCenterId,
      type,
      externalId,
    });

    if (this.hasOrga) {
      const orgaId = databaseBuilder.factory.buildOrganization({
        id: sessionAuthorizationInfo.scoIsManagingStudentsOrganizationId ?? undefined,
        type: 'SCO',
        externalId,
        archivedAt: null,
        isManagingStudents: true,
      }).id;
      sessionAuthorizationInfo.scoIsManagingStudentsOrganizationId = orgaId;
    }

    const sessionId = databaseBuilder.factory.buildSession({
      id: sessionAuthorizationInfo.id ?? undefined,
      finalizedAt: sessionAuthorizationInfo.finalizedAt,
      certificationCenterId,
    }).id;
    sessionAuthorizationInfo.id = sessionId;
    if (sessionAuthorizationInfo.firstCertificationStartedAt) {
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        candidateId,
        createdAt: sessionAuthorizationInfo.firstCertificationStartedAt,
      }).id;
      databaseBuilder.factory.buildAssessment({
        certificationCourseId,
        state: 'started',
      });
    }

    return sessionAuthorizationInfo;
  }

  /**
   * Materializes the read-model SessionAuthorizationInfo without touching the database.
   *
   * @returns {SessionAuthorizationInfo}
   */
  build() {
    const organizationId = this.hasOrga ? (this.scoIsManagingStudentsOrganizationId ?? 1) : null;
    return new SessionAuthorizationInfo({
      id: this.id,
      finalizedAt: this.finalizedAt,
      firstCertificationStartedAt: this.firstCertificationStartedAt,
      scoIsManagingStudentsOrganizationId: organizationId,
      certificationCenterId: this.certificationCenterId,
    });
  }
}

/**
 * Entry point of the fluent SessionAuthorizationInfo builder. Returns the builder, NOT a SessionAuthorizationInfo:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {SessionAuthorizationInfoBuilder}
 */
export function sessionAuthorizationInfoBuilder() {
  return new SessionAuthorizationInfoBuilder();
}
