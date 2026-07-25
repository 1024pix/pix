import { CandidateAuthorization } from '../../../../../../src/certification/evaluation/domain/models/CandidateAuthorization.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

const THIRTY_HOURS_IN_MS = 30 * 60 * 60 * 1000;
/**
 * Fluent builder for the {@link CandidateAuthorization} domain model.
 *
 * @example
 * const candidateAuthorization = domainBuilder.certification.sessionManagement
 *   .candidateAuthorizationBuilder()
 *   .withSession()
 *   .asAuthorizedToStart()
 *   .withParameters({ userId: 456 })
 *   .insertToDB({ databaseBuilder });
 */
class CandidateAuthorizationBuilder {
  constructor() {
    this.id = null;
    this.accessCode = 'ABC123';
    this.sessionId = null;
    this.isSessionAccessible = true;
    this.userId = null;
    this.reconciledAt = null;
    this.subscription = Frameworks.CORE;
    this.authorizedToStart = true;
    this.shouldCreateCertification = true;
    this.certificationId = null;
    this.hasExceededCertificationDuration = false;
    this.isCenterHabilitatedForCandidateSubscription = false;
  }

  /**
   * Set the session data
   *
   * @param {object} [params]
   * @param {number} [params.sessionId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted session (id null)
   * @param {string} [params.accessCode]
   * @param {boolean} [params.isAccessible]
   * @returns {CandidateAuthorizationBuilder}
   */
  withSession({ sessionId = null, accessCode = 'ABC123', isAccessible = true } = {}) {
    this.sessionId = sessionId;
    this.isSessionAccessible = isAccessible;
    this.accessCode = accessCode;
    return this;
  }

  /**
   * As if the candidate has a certification
   *
   * @param {object} [params]
   * @param {number} [params.certificationId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted certification-course (id null)
   * @param {boolean} [params.hasExceededCertificationDuration]
   * @returns {CandidateAuthorizationBuilder}
   */
  hasACertification({ certificationId = null, hasExceededCertificationDuration = true } = {}) {
    this.shouldCreateCertification = true;
    this.hasExceededCertificationDuration = hasExceededCertificationDuration;
    this.certificationId = certificationId;
    return this;
  }

  /**
   * As if the invigilator authorized the candidate to enter the session
   *
   * @returns {CandidateAuthorizationBuilder}
   */
  asAuthorizedToStart() {
    this.authorizedToStart = true;
    return this;
  }

  /**
   * As if the invigilator authorized the candidate to enter the session
   *
   * @returns {CandidateAuthorizationBuilder}
   */
  asNotAuthorizedToStart() {
    this.authorizedToStart = false;
    return this;
  }

  /**
   * Reconciles candidate with a user
   *
   * @param {object} [params]
   * @param {number} [params.userId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted user (id null)
   * @param {Date} [params.at]
   * @returns {CandidateAuthorizationBuilder}
   */
  reconciled({ userId = null, at = new Date() } = {}) {
    this.userId = userId;
    this.reconciledAt = at;
    return this;
  }

  /**
   * Subscription
   *
   * @param {object} [params]
   * @param {string} [params.framework]
   * @param {boolean} [params.isCenterHabilitated]
   * @returns {CandidateAuthorizationBuilder}
   */
  subscribedTo({ framework = Frameworks.CORE, isCenterHabilitated = true } = {}) {
    this.subscription = framework;
    this.isCenterHabilitatedForCandidateSubscription = isCenterHabilitated;
    return this;
  }

  /**
   * Overrides any subset of the CandidateAuthorizationBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted candidate (id null)   * @returns {CandidateAuthorizationBuilder}
   * @returns {CandidateAuthorizationBuilder}
   */
  withParameters({ id } = {}) {
    this.id = id ?? this.id;
    return this;
  }

  /**
   * Inserts corresponding candidate row and all the underlying necessary data
   * then returns the built domain CandidateAuthorization carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @param {object} params.complementaryCertificationIdsByFramework
   * @returns {CandidateAuthorization} the persisted candidateAuthorization
   */
  insertToDB({ databaseBuilder, complementaryCertificationIdsByFramework = {} }) {
    const candidateAuthorization = this.build();

    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    if (
      candidateAuthorization.isCenterHabilitatedForCandidateSubscription &&
      candidateAuthorization.subscription !== Frameworks.CORE
    ) {
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: complementaryCertificationIdsByFramework[candidateAuthorization.subscription],
      });
    }
    const sessionId = databaseBuilder.factory.buildSession({
      id: this.sessionId ?? undefined,
      accessCode: candidateAuthorization.accessCode,
      finalizedAt: candidateAuthorization.isSessionAccessible ? new Date() : null,
      publishedAt: null,
      certificationCenterId,
    }).id;

    if (candidateAuthorization.reconciledAt) {
      const userId = databaseBuilder.factory.buildUser({ id: candidateAuthorization.userId ?? undefined }).id;
      candidateAuthorization.userId = userId;
    }
    const candidateId = databaseBuilder.factory.buildCertificationCandidate({
      id: candidateAuthorization.id ?? undefined,
      userId: candidateAuthorization.userId,
      reconciledAt: candidateAuthorization.reconciledAt,
      subscription: candidateAuthorization.subscription,
      authorizedToStart: candidateAuthorization.authorizedToStart,
      authorizedToStartAt: candidateAuthorization.authorizedToStart ? new Date() : null,
      sessionId,
    }).id;
    if (this.shouldCreateCertification) {
      let createdAt;
      if (candidateAuthorization.hasExceededCertificationDuration) {
        createdAt = new Date(new Date().getTime() - THIRTY_HOURS_IN_MS);
      } else {
        createdAt = new Date();
      }
      const certificationId = databaseBuilder.factory.buildCertificationCourse({
        id: candidateAuthorization.certificationId ?? undefined,
        sessionId,
        candidateId,
        userId: candidateAuthorization.userId,
        createdAt,
      }).id;
      candidateAuthorization.certificationId = certificationId;
    }
    candidateAuthorization.id = candidateId;

    return candidateAuthorization;
  }

  /**
   * Materializes the read-model CandidateAuthorization without touching the database.
   *
   * @returns {CandidateAuthorization}
   */
  build() {
    return new CandidateAuthorization({
      id: this.id,
      isSessionAccessible: this.isSessionAccessible,
      accessCode: this.accessCode,
      userId: this.userId,
      reconciledAt: this.reconciledAt,
      subscription: this.subscription,
      authorizedToStart: this.authorizedToStart,
      certificationId: this.certificationId,
      hasExceededCertificationDuration: this.hasExceededCertificationDuration,
      isCenterHabilitatedForCandidateSubscription: this.isCenterHabilitatedForCandidateSubscription,
    });
  }
}

/**
 * Entry point of the fluent CandidateAuthorization builder. Returns the builder, NOT a CandidateAuthorization:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {CandidateAuthorizationBuilder}
 */
export function candidateAuthorizationBuilder() {
  return new CandidateAuthorizationBuilder();
}
