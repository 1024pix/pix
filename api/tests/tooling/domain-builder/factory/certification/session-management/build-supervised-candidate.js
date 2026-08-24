/**
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link SupervisedCandidate} domain model. DB ONLY
 *
 * @example
 * const supervisedCandidate = domainBuilder.certification.sessionManagement
 *   .supervisedCandidateBuilder()
 *   .asAuthorizedToStart()
 *   .inSession({ sessionId: 456})
 *   .withParameters({ id: 123 })
 *   .insertToDB({ databaseBuilder });
 */
class SupervisedCandidateBuilder {
  constructor() {
    this.id = null;
    this.existingSessionId = null;
    this.authorizedToStartAt = null;
  }

  /**
   * Set the ID of the existing session the candidate is enrolled in
   *
   * @param {object} [params]
   * @param {number} [params.sessionId] - explicit id of an already existing session, it will not be created in DB
   * @returns {SupervisedCandidateBuilder}
   */
  inExistingSession({ sessionId = null } = {}) {
    this.existingSessionId = sessionId;
    return this;
  }

  /**
   * As if the invigilator authorized the candidate to enter the session
   *
   * @param {object} [params]
   * @param {Date} [params.authorizedAt]
   * @returns {SupervisedCandidateBuilder}
   */
  asAuthorizedToStart({ authorizedAt = new Date() }) {
    this.authorizedToStartAt = authorizedAt;
    return this;
  }

  /**
   * As if the invigilator authorized the candidate to enter the session
   *
   * @returns {SupervisedCandidateBuilder}
   */
  asNotAuthorizedToStart() {
    this.authorizedToStartAt = null;
    return this;
  }

  /**
   * Overrides any subset of the SupervisedCandidateBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted candidate (id null)
   * @returns {SupervisedCandidateBuilder}
   */
  withParameters({ id } = {}) {
    this.id = id ?? this.id;
    return this;
  }

  /**
   * Inserts corresponding candidate row and all the underlying necessary data
   * then returns the built domain SupervisedCandidate carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {void}
   */
  insertToDB({ databaseBuilder }) {
    if (!this.existingSessionId) {
      this.existingSessionId = databaseBuilder.factory.buildSession({
        id: this.sessionId ?? undefined,
      }).id;
    }

    const candidateId = databaseBuilder.factory.buildCertificationCandidate({
      id: this.id ?? undefined,
      sessionId: this.existingSessionId,
      authorizedToStartAt: this.authorizedToStartAt,
    });
    this.id = candidateId;
  }

  /**
   * Materializes the model SupervisedCandidate without touching the database... not yet
   *
   * @returns {null}
   */
  build() {
    return null;
  }
}

/**
 * Entry point of the fluent SupervisedCandidate builder. Returns the builder, NOT a SupervisedCandidate:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {SupervisedCandidateBuilder}
 */
export function supervisedCandidateBuilder() {
  return new SupervisedCandidateBuilder();
}
