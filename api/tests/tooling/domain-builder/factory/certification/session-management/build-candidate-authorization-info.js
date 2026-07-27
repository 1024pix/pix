import { CandidateAuthorizationInfo } from '../../../../../../src/certification/session-management/domain/read-models/CandidateAuthorizationInfo.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link CandidateAuthorizationInfo} domain read-model.
 *
 * @example
 * const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
 *   .candidateAuthorizationInfoBuilder()
 *   .withSession()
 *   .asAuthorizedToStart()
 *   .withParameters({ reconciledUserId: 456 })
 *   .insertToDB({ databaseBuilder });
 */
class CandidateAuthorizationInfoBuilder {
  constructor() {
    this.id = null;
    this.sessionId = null;
    this.sessionAccessCode = 'ABC123';
    this.sessionFinalizedAt = null;
    this.sessionPublishedAt = null;
    this.reconciledUserId = null;
    this.reconciledAt = null;
    this.subscription = Frameworks.CORE;
    this.certificationId = null;
    this.certificationStartedAt = null;
    this.authorizedToStartAt = new Date();
    this.centerHabilitations = {};
  }

  /**
   * Set the session data
   *
   * @param {object} [params]
   * @param {number} [params.certificationId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted certification-course (id null)
   * @param {Date} [params.startedAt]
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  withCertificationStartedAt({ certificationId = null, startedAt = new Date() } = {}) {
    this.certificationId = certificationId;
    this.certificationStartedAt = startedAt;
    return this;
  }

  /**
   * Set the session data
   *
   * @param {object} [params]
   * @param {number} [params.sessionId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted session (id null)
   * @param {string} [params.accessCode]
   * @param {boolean} [params.isAccessible]
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  withSession({ sessionId = null, accessCode = 'ABC123', isAccessible = true } = {}) {
    this.sessionId = sessionId;
    this.sessionAccessCode = accessCode;
    this.sessionFinalizedAt = isAccessible ? null : new Date();
    this.sessionPublishedAt = null;
    return this;
  }

  /**
   * Add habilitation to the center in charge of the session
   *
   * @param {object} [params]
   * @param {string} [params.scope]
   *
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  withCenterHabilitation({ scope }) {
    this.centerHabilitations[scope] = true;
    return this;
  }

  /**
   * As if the invigilator authorized the candidate to enter the session
   *
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  asAuthorizedToStart() {
    this.authorizedToStartAt = new Date();
    return this;
  }

  /**
   * As if the invigilator authorized the candidate a long time ago
   *
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  asObsoleteAuthorizedToStart() {
    this.authorizedToStartAt = new Date();
    this.authorizedToStartAt.setMinutes(this.authorizedToStartAt.getMinutes() - 16);
    return this;
  }

  /**
   * As if the invigilator authorized the candidate to enter the session
   *
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  asNotAuthorizedToStart() {
    this.authorizedToStartAt = null;
    return this;
  }

  /**
   * Reconciles candidate with a user
   *
   * @param {object} [params]
   * @param {number} [params.userId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted user (id null)
   * @param {Date} [params.at]
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  reconciled({ userId = null, at = new Date() } = {}) {
    this.reconciledUserId = userId;
    this.reconciledAt = at;
    return this;
  }

  /**
   * Subscription
   *
   * @param {object} [params]
   * @param {string} [params.framework]
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  subscribedTo({ framework } = {}) {
    this.subscription = framework;
    return this;
  }

  /**
   * Overrides any subset of the CandidateAuthorizationInfoBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted candidate (id null)
   * @returns {CandidateAuthorizationInfoBuilder}
   */
  withParameters({ id } = {}) {
    this.id = id ?? this.id;
    return this;
  }

  /**
   * Inserts corresponding candidate row and all the underlying necessary data
   * then returns the built domain CandidateAuthorizationInfo carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @param {object} params.complementaryCertificationIdsByFramework
   * @returns {CandidateAuthorizationInfo} the persisted candidateAuthorizationInfo
   */
  insertToDB({ databaseBuilder, complementaryCertificationIdsByFramework = {} }) {
    const candidateAuthorizationInfo = this.build();

    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    for (const [framework, isHabilitated] of Object.entries(candidateAuthorizationInfo.centerHabilitations)) {
      if (framework === Frameworks.CORE || !isHabilitated) continue;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: complementaryCertificationIdsByFramework[framework],
      });
    }
    const sessionId = databaseBuilder.factory.buildSession({
      id: candidateAuthorizationInfo.sessionId ?? undefined,
      accessCode: candidateAuthorizationInfo.sessionAccessCode,
      finalizedAt: candidateAuthorizationInfo.sessionFinalizedAt,
      publishedAt: candidateAuthorizationInfo.sessionPublishedAt,
      certificationCenterId,
    }).id;
    candidateAuthorizationInfo.sessionId = sessionId;

    if (candidateAuthorizationInfo.reconciledAt) {
      const userId = databaseBuilder.factory.buildUser({ id: candidateAuthorizationInfo.reconciledUserId }).id;
      candidateAuthorizationInfo.reconciledUserId = userId;
    }
    const candidateId = databaseBuilder.factory.buildCertificationCandidate({
      id: candidateAuthorizationInfo.id ?? undefined,
      userId: candidateAuthorizationInfo.reconciledUserId,
      authorizedToStart: Boolean(candidateAuthorizationInfo.authorizedToStartAt),
      authorizedToStartAt: candidateAuthorizationInfo.authorizedToStartAt,
      sessionId,
      subscription: candidateAuthorizationInfo.subscription,
      reconciledAt: candidateAuthorizationInfo.reconciledAt,
    }).id;
    if (candidateAuthorizationInfo.certificationStartedAt) {
      const certificationId = databaseBuilder.factory.buildCertificationCourse({
        id: candidateAuthorizationInfo.certificationId ?? undefined,
        candidateId,
        sessionId,
        userId: candidateAuthorizationInfo.reconciledUserId,
        createdAt: candidateAuthorizationInfo.certificationStartedAt,
      }).id;
      candidateAuthorizationInfo.certificationId = certificationId;
    }
    candidateAuthorizationInfo.id = candidateId;

    return candidateAuthorizationInfo;
  }

  /**
   * Materializes the read-model CandidateAuthorizationInfo without touching the database.
   *
   * @returns {CandidateAuthorizationInfo}
   */
  build() {
    return new CandidateAuthorizationInfo({
      id: this.id,
      sessionId: this.sessionId,
      sessionAccessCode: this.sessionAccessCode,
      sessionFinalizedAt: this.sessionFinalizedAt,
      sessionPublishedAt: this.sessionPublishedAt,
      authorizedToStartAt: this.authorizedToStartAt,
      reconciledUserId: this.reconciledUserId,
      reconciledAt: this.reconciledAt,
      subscription: this.subscription,
      certificationId: this.certificationId,
      certificationStartedAt: this.certificationStartedAt,
      centerHabilitations: this.centerHabilitations,
    });
  }
}

/**
 * Entry point of the fluent CandidateAuthorizationInfo builder. Returns the builder, NOT a CandidateAuthorizationInfo:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {CandidateAuthorizationInfoBuilder}
 */
export function candidateAuthorizationInfoBuilder() {
  return new CandidateAuthorizationInfoBuilder();
}
