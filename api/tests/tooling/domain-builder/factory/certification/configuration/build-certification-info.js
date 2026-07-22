import {
  defaultCompetencesScoringConfiguration,
  defaultGlobalScoringConfiguration,
} from '../../../../../../db/database-builder/factory/build-certification-version.js';
import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { CertificationInfo } from '../../../../../../src/certification/configuration/domain/read-models/CertificationInfo.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * @typedef {import('../../../../../../src/certification/shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link CertificationInfo} domain read-model.
 *
 * @example
 * const certificationInfo = domainBuilder.certification.configuration
 *   .certificationInfoBuilder()
 *   .asActive()
 *   .withParameters({ framework: SCOPES.PIX_PLUS_DROIT })
 *   .insertToDB({ databaseBuilder });
 */
class CertificationInfoBuilder {
  constructor() {
    this.framework = Frameworks.CORE;
    this.startDate = null;
    this.expirationDate = null;
    this.assessmentDuration = 60;
    this.minimumAssessmentLength = 20;
    this.maximumAssessmentLength = 50;
    this.status = VERSION_STATUSES.DRAFT;
  }

  /**
   * Marks as draft.
   *
   * @returns {CertificationInfoBuilder}
   */
  asDraft() {
    this.status = VERSION_STATUSES.DRAFT;
    this.startDate = null;
    this.expirationDate = null;
    return this;
  }

  /**
   * Marks as active.
   *
   * @returns {CertificationInfoBuilder}
   */
  asActive() {
    this.status = VERSION_STATUSES.ACTIVE;
    this.startDate = new Date('2024-01-01');
    this.expirationDate = null;
    return this;
  }

  /**
   * Marks the as archived.
   *
   * @returns {CertificationInfoBuilder}
   */
  asArchived() {
    this.status = VERSION_STATUSES.ARCHIVED;
    this.startDate = new Date('2024-01-01');
    this.expirationDate = new Date('2024-12-31');
    return this;
  }

  /**
   * Overrides any subset of the CertificationInfo attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {SCOPES} [params.framework]
   * @param {number} [params.assessmentDuration]
   * @param {number} [params.minimumAssessmentLength]
   * @param {number} [params.maximumAssessmentLength]
   * @returns {CertificationInfoBuilder}
   */
  withParameters({ framework, assessmentDuration, minimumAssessmentLength, maximumAssessmentLength } = {}) {
    this.framework = framework ?? this.framework;
    this.assessmentDuration = assessmentDuration ?? this.assessmentDuration;
    this.minimumAssessmentLength = minimumAssessmentLength ?? this.minimumAssessmentLength;
    this.maximumAssessmentLength = maximumAssessmentLength ?? this.maximumAssessmentLength;
    return this;
  }

  /**
   * Inserts the necessary underlying data in the database
   * then returns the built domain CertificationInfo
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {CertificationInfo}
   */
  insertToDB({ databaseBuilder }) {
    const certificationInfo = this.build();

    const row = databaseBuilder.factory.buildCertificationVersion({
      scope: certificationInfo.framework,
      startDate: this.startDate,
      expirationDate: this.expirationDate,
      assessmentDuration: certificationInfo.assessmentDuration,
      minimumAnswersRequiredToValidateACertification: certificationInfo.minimumAssessmentLength,
      globalScoringConfiguration: defaultGlobalScoringConfiguration,
      competencesScoringConfiguration: defaultCompetencesScoringConfiguration,
      challengesConfiguration: {
        maximumAssessmentLength: certificationInfo.maximumAssessmentLength,
      },
      status: certificationInfo.status,
    });

    databaseBuilder.factory.buildCertificationVersionTube({
      versionId: row.id,
      tubeId: 'fooTube',
    });

    return this.build();
  }

  /**
   * Materializes the domain CertificationInfo without touching the database.
   *
   * @returns {CertificationInfo}
   */
  build() {
    return new CertificationInfo({
      framework: this.framework,
      status: this.status,
      assessmentDuration: this.assessmentDuration,
      minimumAssessmentLength: this.minimumAssessmentLength,
      maximumAssessmentLength: this.maximumAssessmentLength,
    });
  }
}

/**
 * Entry point of the fluent CertificationInfo builder. Returns the builder, NOT a CertificationInfo:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {CertificationInfoBuilder}
 */
export function certificationInfoBuilder() {
  return new CertificationInfoBuilder();
}
