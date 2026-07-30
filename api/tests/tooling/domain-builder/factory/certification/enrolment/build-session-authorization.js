import { SessionAuthorization } from '../../../../../../src/certification/enrolment/domain/models/SessionAuthorization.js';

/**
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

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
    this.isFinalized = false;
    this.hasExpired = false;
    this.hasStarted = false;
  }

  /**
   * Can enroll for individual enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  canEnrollCandidateIndividually() {
    this.isFinalized = false;
    this.hasExpired = false;
    this.hasStarted = false;
    return this;
  }

  /**
   * Cannot enroll for individual enrolment
   *
   * @returns {SessionAuthorizationBuilder}
   */
  cannotEnrollCandidateIndividually() {
    this.isFinalized = false;
    this.hasExpired = true;
    this.hasStarted = true;
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
  withParameters({ id, isFinalized = false, hasExpired = false, hasStarted = false } = {}) {
    this.id = id ?? this.id;
    this.isFinalized = isFinalized;
    this.hasExpired = hasExpired;
    this.hasStarted = hasStarted;
    return this;
  }

  /**
   * Inserts corresponding candidate row and all the underlying necessary data
   * then returns the built domain SessionAuthorization carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {SessionAuthorization} the persisted sessionAuthorization
   */
  insertToDB({ databaseBuilder }) {
    const sessionAuthorization = this.build();
    const finalizedAt = sessionAuthorization.isFinalized ? null : new Date();
    const sessionId = databaseBuilder.factory.buildSession({
      id: this.id ?? undefined,
      finalizedAt,
    }).id;

    if (sessionAuthorization.hasStarted) {
      const startDateTime = new Date();
      const hoursBefore = sessionAuthorization.hasExpired ? 25 : 12;
      startDateTime.setHours(startDateTime.getHours() - hoursBefore);
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        candidateId,
        createdAt: startDateTime,
      });
    }

    return sessionAuthorization;
  }

  /**
   * Materializes the read-model SessionAuthorization without touching the database.
   *
   * @returns {SessionAuthorization}
   */
  build() {
    return new SessionAuthorization({
      id: this.id,
      isFinalized: this.isFinalized,
      hasExpired: this.hasExpired,
      hasStarted: this.hasStarted,
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
