import {
  defaultChallengesConfiguration,
  defaultCompetencesScoringConfiguration,
  defaultGlobalScoringConfiguration,
} from '../../../../../../db/database-builder/factory/build-certification-version.js';
import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { CertificationCourseInfo } from '../../../../../../src/certification/evaluation/domain/read-models/CertificationCourseInfo.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';

/**
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link CertificationCourseInfo} domain model.
 *
 * @example
 * const certificationCourseInfo = domainBuilder.certification.sessionManagement
 *   .certificationCourseInfoBuilder()
 *   .withIdentity({ firstName: 'Lolo', lastName: 'COUCOU' })
 *   .withParameters({ id: 123 , assessmentId: 456 })
 *   .insertToDB({ databaseBuilder });
 */
class CertificationCourseInfoBuilder {
  constructor() {
    this.id = null;
    this.nbChallenges = 32;
    this.existingVersionId = null;
    this.firstName = 'Buffy';
    this.lastName = 'Summers';
    this.version = AlgorithmEngineVersion.V3;
    this.isAdjustedForAccessibility = false;
    this.assessmentId = null;
  }

  /**
   * Set the first name and last name
   *
   * @returns {CertificationCourseInfoBuilder}
   */
  withIdentity({ firstName, lastName }) {
    this.firstName = firstName;
    this.lastName = lastName;
    return this;
  }

  /**
   * Set the number of challenges.
   * When this.existingVersionId exists, use this to indicates what is the number of challenges expected
   * If no this.existingVersionId, insertToDB will create a dedicated version for this model
   *
   * @returns {CertificationCourseInfoBuilder}
   */
  withNbChallenges(nbChallenges) {
    this.nbChallenges = nbChallenges;
    return this;
  }

  /**
   * Enables adjustement for a11y
   *
   * @returns {CertificationCourseInfoBuilder}
   */
  asAdjustedForAccessibility() {
    this.isAdjustedForAccessibility = true;
    return this;
  }

  /**
   * Overrides any subset of the CertificationCourseInfoBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted certification-course (id null)
   * @param {number} [params.assessmentId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted assesment (id null)
   * @param {number} [params.existingVersionId] - already existing version. Will overwrite nbChallenges and no create itself a version
   * @returns {CertificationCourseInfoBuilder}
   */
  withParameters({ id, assessmentId, existingVersionId } = {}) {
    this.id = id ?? this.id;
    this.assessmentId = assessmentId ?? this.assessmentId;
    this.existingVersionId = existingVersionId ?? this.existingVersionId;
    return this;
  }

  /**
   * Inserts corresponding certification-course row and all the underlying necessary data
   * then returns the built domain CertificationCourseInfo carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {CertificationCourseInfo} the persisted certificationCourseInfo
   */
  insertToDB({ databaseBuilder }) {
    const certificationCourseInfo = this.build();

    const sessionId = databaseBuilder.factory.buildSession().id;
    const userId = databaseBuilder.factory.buildUser().id;
    const candidateId = databaseBuilder.factory.buildCertificationCandidate({
      sessionId,
      accessibilityAdjustmentNeeded: this.isAdjustedForAccessibility,
      userId,
      reconciledAt: new Date(),
    }).id;

    if (!this.existingVersionId) {
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date(),
        expirationDate: null,
        assessmentDuration: 100,
        minimumAnswersRequiredToValidateACertification: 11,
        globalScoringConfiguration: defaultGlobalScoringConfiguration,
        competencesScoringConfiguration: defaultCompetencesScoringConfiguration,
        challengesConfiguration: {
          ...defaultChallengesConfiguration,
          maximumAssessmentLength: this.nbChallenges,
        },
        status: VERSION_STATUSES.ACTIVE,
        comments: null,
      }).id;
      this.existingVersionId = versionId;
    }
    const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      id: this.id ?? undefined,
      sessionId,
      candidateId,
      userId,
      version: this.version,
      versionId: this.existingVersionId,
      firstName: this.firstName,
      lastName: this.lastName,
    }).id;
    const assessmentId = databaseBuilder.factory.buildAssessment({
      id: this.assessmentId ?? undefined,
      type: Assessment.types.CERTIFICATION,
      certificationCourseId,
    }).id;
    certificationCourseInfo.id = certificationCourseId;
    certificationCourseInfo.assessmentId = assessmentId;

    return certificationCourseInfo;
  }

  /**
   * Materializes the model CertificationCourseInfo without touching the database.
   *
   * @returns {CertificationCourseInfo}
   */
  build() {
    return new CertificationCourseInfo({
      id: this.id,
      nbChallenges: this.nbChallenges,
      firstName: this.firstName,
      lastName: this.lastName,
      version: this.version,
      isAdjustedForAccessibility: this.isAdjustedForAccessibility,
      assessmentId: this.assessmentId,
    });
  }
}

/**
 * Entry point of the fluent CertificationCourseInfo builder. Returns the builder, NOT a CertificationCourseInfo:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {CertificationCourseInfoBuilder}
 */
export function certificationCourseInfoBuilder() {
  return new CertificationCourseInfoBuilder();
}
