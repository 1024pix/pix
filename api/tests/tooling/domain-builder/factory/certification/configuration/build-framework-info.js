import {
  defaultChallengesConfiguration,
  defaultCompetencesScoringConfiguration,
  defaultGlobalScoringConfiguration,
} from '../../../../../../db/database-builder/factory/build-certification-version.js';
import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { BadgeSummary } from '../../../../../../src/certification/configuration/domain/read-models/BadgeSummary.js';
import { FrameworkInfo } from '../../../../../../src/certification/configuration/domain/read-models/FrameworkInfo.js';
import { TargetProfileSummary } from '../../../../../../src/certification/configuration/domain/read-models/TargetProfileSummary.js';
import { VersionSummary } from '../../../../../../src/certification/configuration/domain/read-models/VersionSummary.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * @typedef {import('../../../../../../src/certification/shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link FrameworkInfo} domain read-model.
 *
 * @example
 * const frameworkInfo = domainBuilder.certification.configuration
 *   .buildFrameworkInfo()
 *   .withActiveVersion({ startDate: new Date('2025-01-01'), assessmentDuration: 45 })
 *   .withParameters({ scope: SCOPES.PIX_PLUS_DROIT })
 *   .insertToDB({ databaseBuilder });
 */
class FrameworkInfoBuilder {
  constructor() {
    this.id = Frameworks.CORE;
    this.scope = Frameworks.CORE;
    this.versionSummariesData = [];
    this.targetProfileSummariesData = [];
  }

  /**
   * Adds an active version
   *
   * @param {object} params
   * @param {number} [params.id]
   * @param {Date} [params.startDate] - defaults to 2026-01-01
   * @param {number} [params.assessmentDuration] - defaults to 31
   * @param {number} [params.maximumAssessmentLength] - defaults to 51
   * @returns {FrameworkInfoBuilder}
   */
  withActiveVersion({ id, startDate = new Date('2026-01-01'), assessmentDuration = 31, maximumAssessmentLength = 51 }) {
    this.versionSummariesData.push({
      id,
      startDate,
      expirationDate: null,
      assessmentDuration,
      maximumAssessmentLength,
      status: VERSION_STATUSES.ACTIVE,
    });
    return this;
  }

  /**
   * Adds an archived version
   *
   * @param {object} params
   * @param {number} [params.id]
   * @param {Date} [params.startDate] - defaults to 2025-01-01
   * @param {Date} [params.expirationDate] - defaults to 2025-02-02
   * @param {number} [params.assessmentDuration] - defaults to 32
   * @param {number} [params.maximumAssessmentLength] - defaults to 52
   * @returns {FrameworkInfoBuilder}
   */
  withArchivedVersion({
    id,
    startDate = new Date('2025-01-01'),
    expirationDate = new Date('2025-02-02'),
    assessmentDuration = 32,
    maximumAssessmentLength = 52,
  }) {
    this.versionSummariesData.push({
      id,
      startDate,
      expirationDate,
      assessmentDuration,
      maximumAssessmentLength,
      status: VERSION_STATUSES.ARCHIVED,
    });
    return this;
  }

  /**
   * Adds an draft version
   *
   * @param {object} params
   * @param {number} [params.id]
   * @param {Date} [params.startDate] - defaults to 2027-01-01
   * @param {number} [params.assessmentDuration] - defaults to 33
   * @param {number} [params.maximumAssessmentLength] - defaults to 53
   * @returns {FrameworkInfoBuilder}
   */
  withDraftVersion({ id, startDate = new Date('2027-01-01'), assessmentDuration = 33, maximumAssessmentLength = 53 }) {
    this.versionSummariesData.push({
      id,
      startDate,
      assessmentDuration,
      maximumAssessmentLength,
      status: VERSION_STATUSES.DRAFT,
    });
    return this;
  }

  /**
   * Adds a target profile and badges
   *
   * @param {object} params
   * @param {number} [params.id]
   * @param {string} [params.name]
   * @param {object[]} [params.badgesData]
   * @returns {FrameworkInfoBuilder}
   */
  withTargetProfile({ id, name, badgesData }) {
    this.targetProfileSummariesData.push({
      id,
      name,
      badgeSummariesData: badgesData,
    });
    return this;
  }

  /**
   * Overrides any direct attributes of the FrameworkInfo model carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {SCOPES} [params.scope]
   * @returns {FrameworkInfoBuilder}
   */
  withParameters({ scope } = {}) {
    this.id = scope ?? this.id;
    this.scope = scope ?? this.scope;
    return this;
  }

  /**
   * Inserts the underlying data necessary in DB to build the FrameworkInfo read-model.
   * then returns the built FrameworkInfo
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {FrameworkInfo}
   */
  insertToDB({ databaseBuilder }) {
    const frameworkInfo = this.build();
    let complementaryCertificationId;
    if (frameworkInfo.scope !== Frameworks.CORE) {
      complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        key: frameworkInfo.scope,
      }).id;
    }

    for (const versionSummary of frameworkInfo.versionSummaries) {
      const row = databaseBuilder.factory.buildCertificationVersion({
        id: versionSummary.id,
        scope: frameworkInfo.scope,
        startDate: versionSummary.startDate,
        expirationDate: versionSummary.expirationDate,
        assessmentDuration: versionSummary.assessmentDuration,
        minimumAnswersRequiredToValidateACertification: 123,
        globalScoringConfiguration: defaultGlobalScoringConfiguration,
        competencesScoringConfiguration: defaultCompetencesScoringConfiguration,
        challengesConfiguration: {
          ...defaultChallengesConfiguration,
          maximumAssessmentLength: versionSummary.maximumAssessmentLength ?? 40,
        },
        status: versionSummary.status,
        comments: null,
      });
      versionSummary.id = row.id;
    }

    for (const targetProfileSummary of frameworkInfo.targetProfileSummaries) {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile({
        id: targetProfileSummary.id,
        name: targetProfileSummary.name,
      }).id;
      for (const badgeSummary of targetProfileSummary.badgeSummaries) {
        const badgeId = databaseBuilder.factory.buildBadge({
          id: badgeSummary.id,
          targetProfileId,
          isCertifiable: true,
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId,
          complementaryCertificationId,
          label: badgeSummary.label,
          level: badgeSummary.level,
          imageUrl: badgeSummary.imageUrl,
          minimumEarnedPix: badgeSummary.minimumEarnedPix,
          createdAt: badgeSummary.createdAt,
          detachedAt: badgeSummary.detachedAt,
        });
        badgeSummary.id = badgeId;
      }
      targetProfileSummary.id = targetProfileId;
    }
    return frameworkInfo;
  }

  /**
   * Materializes the domain Version without touching the database.
   * The challenges configuration is merged over the builder defaults.
   *
   * @returns {FrameworkInfo}
   */
  build() {
    const versionSummaries = this.versionSummariesData.map(
      (versionSummaryData) =>
        new VersionSummary({
          id: versionSummaryData.id,
          startDate: versionSummaryData.startDate,
          expirationDate: versionSummaryData.expirationDate,
          assessmentDuration: versionSummaryData.assessmentDuration,
          maximumAssessmentLength: versionSummaryData.maximumAssessmentLength,
          status: versionSummaryData.status,
        }),
    );

    const targetProfileSummaries = this.targetProfileSummariesData.map(
      (targetProfileSummaryData) =>
        new TargetProfileSummary({
          id: targetProfileSummaryData.id,
          name: targetProfileSummaryData.name,
          badgeSummaries: targetProfileSummaryData.badgeSummariesData.map((badgeData) => new BadgeSummary(badgeData)),
        }),
    );

    return new FrameworkInfo({
      id: this.id,
      scope: this.scope,
      versionSummaries,
      targetProfileSummaries,
    });
  }
}

/**
 * Entry point of the fluent FrameworkInfo builder. Returns the builder, NOT a FrameworkInfo:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {FrameworkInfoBuilder}
 */
export function buildFrameworkInfo() {
  return new FrameworkInfoBuilder();
}
