import { SupervisedSession } from '../../../../../../src/certification/session-management/domain/models/SupervisedSession.js';

/**
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link SupervisedSession} domain model.
 *
 * @example
 * const supervisedSession = domainBuilder.certification.sessionManagement
 *   .supervisedSessionBuilder()
 *   .withStartedCertifications({ count: 3 })
 *   .withParameters({ id:123 , date: 456 })
 *   .insertToDB({ databaseBuilder });
 */
class SupervisedSessionBuilder {
  constructor() {
    this.id = null;
    this.firstStartedCertificationId = null;
    this.countStartedCertifications = 0;
    this.date = '2021-01-01';
  }

  /**
   * Set the ID of the first certification started in the session
   *
   * @returns {SupervisedSessionBuilder}
   */
  withStartedCertifications({ count = 1, firstStartedCertificationId = null } = {}) {
    this.firstStartedCertificationId = firstStartedCertificationId;
    this.countStartedCertifications = count;
    return this;
  }

  /**
   * Overrides any subset of the SupervisedSessionBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted session (id null)
   * @param {string} [params.date]
   * @returns {SupervisedSessionBuilder}
   */
  withParameters({ id, date } = {}) {
    this.id = id ?? this.id;
    this.date = date ?? this.date;
    return this;
  }

  /**
   * Inserts corresponding session row and all the underlying necessary data
   * then returns the built domain SupervisedSession carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {SupervisedSession} the persisted supervisedSession
   */
  insertToDB({ databaseBuilder }) {
    const supervisedSession = this.build();

    const sessionId = databaseBuilder.factory.buildSession({
      id: supervisedSession.id ?? undefined,
      date: supervisedSession.date,
    }).id;
    supervisedSession.id = sessionId;

    for (let i = 0; i < this.countStartedCertifications; ++i) {
      const userId = databaseBuilder.factory.buildUser().id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId,
      }).id;
      const certificationId = databaseBuilder.factory.buildCertificationCourse({
        id: i === 0 ? (supervisedSession.firstStartedCertificationId ?? undefined) : undefined,
        candidateId,
        userId,
        sessionId,
        createdAt: i === 0 ? new Date('2022-01-01') : new Date(),
      }).id;
      if (i === 0) {
        supervisedSession.firstStartedCertificationId = certificationId;
      }
    }

    return supervisedSession;
  }

  /**
   * Materializes the model SupervisedSession without touching the database.
   *
   * @returns {SupervisedSession}
   */
  build() {
    return new SupervisedSession({
      id: this.id,
      firstStartedCertificationId: this.firstStartedCertificationId,
      date: this.date,
    });
  }
}

/**
 * Entry point of the fluent SupervisedSession builder. Returns the builder, NOT a SupervisedSession:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {SupervisedSessionBuilder}
 */
export function supervisedSessionBuilder() {
  return new SupervisedSessionBuilder();
}
