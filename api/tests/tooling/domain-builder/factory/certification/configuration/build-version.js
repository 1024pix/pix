import {
  defaultCompetencesScoringConfiguration,
  defaultGlobalScoringConfiguration,
} from '../../../../../../db/database-builder/factory/build-certification-version.js';
import { Version, VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import {
  DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
  DEFAULT_SESSION_DURATION_MINUTES,
} from '../../../../../../src/certification/shared/domain/constants.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * @typedef {import('../../../../../../src/certification/shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link Version} domain model.
 *
 * @example
 * const version = domainBuilder.certification.configuration
 *   .versionBuilder()
 *   .asActive({ startDate: new Date('2025-01-01') })
 *   .withParameters({ scope: SCOPES.PIX_PLUS_DROIT, tubeIds: ['recTube1'] })
 *   .insertToDB({ databaseBuilder });
 */
class VersionBuilder {
  constructor() {
    this.scope = Frameworks.CORE;
    this.tubeIds = ['tubeA'];
    this.id = null;
    this.startDate = null;
    this.expirationDate = null;
    this.assessmentDuration = DEFAULT_SESSION_DURATION_MINUTES;
    this.minimumAnswersRequiredToValidateACertification = DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION;
    this.globalScoringConfiguration = [];
    this.competencesScoringConfiguration = [];
    this.challengesConfiguration = null;
    this.comments = null;
    this.status = VERSION_STATUSES.DRAFT;
  }

  /**
   * Marks version as draft.
   *
   * @param {object} params
   * @param {Date} [params.startDate] - defaults to null
   * @returns {VersionBuilder}
   */
  asDraft({ startDate }) {
    this.status = VERSION_STATUSES.DRAFT;
    this.startDate = startDate ?? null;
    this.expirationDate = null;
    return this;
  }

  /**
   * Marks version as active.
   *
   * @param {object} [params]
   * @param {Date} [params.startDate]
   * @returns {VersionBuilder}
   */
  asActive({ startDate = new Date('2024-01-01') } = {}) {
    this.status = VERSION_STATUSES.ACTIVE;
    this.startDate = startDate;
    this.expirationDate = null;
    return this;
  }

  /**
   * Marks the version as archived.
   *
   * @param {object} [params]
   * @param {Date} [params.startDate]
   * @param {Date} [params.expirationDate]
   * @returns {VersionBuilder}
   */
  asArchived({ startDate = new Date('2024-01-01'), expirationDate = new Date('2024-12-31') } = {}) {
    this.status = VERSION_STATUSES.ARCHIVED;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    return this;
  }

  /**
   * Overrides any subset of the Version attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * Note: status, startDate and expirationDate are driven by asDraft/asActive/asArchived.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted version (id null)
   * @param {SCOPES} [params.scope] - certification scope, defaults to Frameworks.CORE
   * @param {Array<string>} [params.tubeIds] - tube ids linked to the version, defaults to ['tubeA'] (use [] for a version without tubes)
   * @param {number} [params.assessmentDuration] - in minutes
   * @param {number} [params.minimumAnswersRequiredToValidateACertification]
   * @param {Array<object>} [params.globalScoringConfiguration]
   * @param {Array<object>} [params.competencesScoringConfiguration]
   * @param {Partial<FlashAssessmentAlgorithmConfiguration>|FlashAssessmentAlgorithmConfiguration} [params.challengesConfiguration] - a partial object is merged over the build() defaults
   * @param {string} [params.comments]
   * @returns {VersionBuilder}
   */
  withParameters({
    id,
    scope,
    tubeIds,
    assessmentDuration,
    minimumAnswersRequiredToValidateACertification,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    challengesConfiguration,
    comments,
  } = {}) {
    this.id = id ?? this.id;
    this.scope = scope ?? this.scope;
    this.tubeIds = tubeIds ?? this.tubeIds;
    this.assessmentDuration = assessmentDuration ?? this.assessmentDuration;
    this.minimumAnswersRequiredToValidateACertification =
      minimumAnswersRequiredToValidateACertification ?? this.minimumAnswersRequiredToValidateACertification;
    this.globalScoringConfiguration = globalScoringConfiguration ?? this.globalScoringConfiguration;
    this.competencesScoringConfiguration = competencesScoringConfiguration ?? this.competencesScoringConfiguration;
    this.challengesConfiguration = challengesConfiguration ?? this.challengesConfiguration;
    this.comments = comments ?? this.comments;
    return this;
  }

  /**
   * Fills both scoring configurations with the realistic defaults of the DB factory
   * (8 mesh levels, full competence levels) — required when the code under test
   * computes actual scores.
   * Values are deep-cloned so a test mutating its version cannot pollute other tests.
   *
   * @returns {VersionBuilder}
   */
  withRealisticScoringConfigurations() {
    this.globalScoringConfiguration = structuredClone(defaultGlobalScoringConfiguration);
    this.competencesScoringConfiguration = structuredClone(defaultCompetencesScoringConfiguration);
    return this;
  }

  /**
   * Inserts the version row and one certification_versions_tubes row per tubeId,
   * then returns the built domain Version carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {Version} the persisted version
   */
  insertToDB({ databaseBuilder }) {
    const version = this.build();

    const row = databaseBuilder.factory.buildCertificationVersion({
      id: version.id ?? undefined,
      scope: version.scope,
      startDate: version.startDate,
      expirationDate: version.expirationDate,
      assessmentDuration: version.assessmentDuration,
      minimumAnswersRequiredToValidateACertification: version.minimumAnswersRequiredToValidateACertification,
      globalScoringConfiguration: version.globalScoringConfiguration,
      competencesScoringConfiguration: version.competencesScoringConfiguration,
      challengesConfiguration: version.challengesConfiguration,
      status: version.status,
      comments: version.comments,
    });

    for (const tubeId of version.tubeIds) {
      databaseBuilder.factory.buildCertificationVersionTube({
        versionId: row.id,
        tubeId,
      });
    }

    this.id = row.id;
    return this.build();
  }

  /**
   * Materializes the domain Version without touching the database.
   * The challenges configuration is merged over the builder defaults.
   *
   * @returns {Version}
   */
  build() {
    const challengesConfiguration = new FlashAssessmentAlgorithmConfiguration({
      challengesBetweenSameCompetence: 0,
      maximumAssessmentLength: 32,
      variationPercent: 1,
      defaultCandidateCapacity: 0,
      defaultProbabilityToPickChallenge: DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: true,
      ...this.challengesConfiguration,
    });

    return new Version({
      id: this.id,
      scope: this.scope,
      startDate: this.startDate,
      expirationDate: this.expirationDate,
      assessmentDuration: this.assessmentDuration,
      minimumAnswersRequiredToValidateACertification: this.minimumAnswersRequiredToValidateACertification,
      globalScoringConfiguration: this.globalScoringConfiguration,
      competencesScoringConfiguration: this.competencesScoringConfiguration,
      challengesConfiguration,
      comments: this.comments,
      status: this.status,
      tubeIds: this.tubeIds,
    });
  }

  /**
   * Copy all the attributes from given Version in the builder
   * @params {Version}
   * @returns {VersionBuilder}
   */
  copy(version) {
    this.id = version.id;
    this.scope = version.scope;
    this.tubeIds = version.tubeIds;
    this.startDate = version.startDate;
    this.expirationDate = version.expirationDate;
    this.assessmentDuration = version.assessmentDuration;
    this.minimumAnswersRequiredToValidateACertification = version.minimumAnswersRequiredToValidateACertification;
    this.globalScoringConfiguration = version.globalScoringConfiguration;
    this.competencesScoringConfiguration = version.competencesScoringConfiguration;
    this.challengesConfiguration = version.challengesConfiguration;
    this.comments = null;
    this.status = VERSION_STATUSES.DRAFT;
    return this;
  }
}

/**
 * Entry point of the fluent Version builder. Returns the builder, NOT a Version:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {VersionBuilder}
 */
export function versionBuilder() {
  return new VersionBuilder();
}
