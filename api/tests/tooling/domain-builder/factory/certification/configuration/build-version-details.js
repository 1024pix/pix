import {
  defaultCompetencesScoringConfiguration,
  defaultGlobalScoringConfiguration,
} from '../../../../../../db/database-builder/factory/build-certification-version.js';
import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { VersionDetails } from '../../../../../../src/certification/configuration/domain/read-models/VersionDetails.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * @typedef {import('../../../../../../src/certification/shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */
/**
 * @typedef {Object} Skill
 * @property {string} id
 * @property {number} difficulty
 */

/**
 * @typedef {Object} Tube
 * @property {string} id
 * @property {string} name
 * @property {string} practicalTitle
 * @property {boolean} mobile
 * @property {boolean} tablet
 * @property {Skill[]} skills
 */

/**
 * @typedef {Object} Thematic
 * @property {string} id
 * @property {string} name
 * @property {number} index
 * @property {Tube[]} tubes
 */

/**
 * @typedef {Object} Competence
 * @property {string} id
 * @property {string} name
 * @property {string} index
 * @property {Thematic[]} thematics
 */

/**
 * @typedef {Object} Area
 * @property {string} id
 * @property {string} frameworkId
 * @property {string} code
 * @property {string} title
 * @property {string} color
 * @property {Competence[]} competences
 */

/**
 * Fluent builder for the {@link VersionDetails} domain read-model.
 *
 * @example
 * const version = domainBuilder.certification.configuration
 *   .versionDetailsBuilder()
 *   .asActive({ startDate: new Date('2025-01-01') })
 *   .withParameters({ scope: SCOPES.PIX_PLUS_DROIT, areas: ...someData })
 *   .insertToDB({ databaseBuilder });
 */
class VersionDetailsBuilder {
  constructor() {
    this.id = null;
    this.scope = Frameworks.CORE;
    this.status = VERSION_STATUSES.DRAFT;
    this.startDate = null;
    this.expirationDate = null;
    this.assessmentDuration = 60;
    this.minimumAnswersRequiredForValidation = 20;
    this.maximumAssessmentLength = 50;
    this.challengesBetweenSameCompetence = 2;
    this.defaultProbabilityToPickChallenge = 41;
    this.defaultCandidateCapacity = 0;
    this.variationPercent = 0.66;
    this.limitToOneQuestionPerTube = true;
    this.enablePassageByAllCompetences = false;
    this.comments = null;
    this.areas = [];
  }

  /**
   * Marks as draft.
   *
   * @param {object} params
   * @param {Date} [params.startDate] - defaults to null
   * @returns {VersionDetailsBuilder}
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
   * @returns {VersionDetailsBuilder}
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
   * @returns {VersionDetailsBuilder}
   */
  asArchived({ startDate = new Date('2024-01-01'), expirationDate = new Date('2024-12-31') } = {}) {
    this.status = VERSION_STATUSES.ARCHIVED;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    return this;
  }

  /**
   * Sets the learning content covered by the version.
   *
   * @param {Area[]} areas
   * @returns {this}
   */
  withLearningContent(areas) {
    this.areas = areas;
    return this;
  }

  /**
   * Overrides any subset of the VersionDetails attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   * Does not allow to set the areas view
   *
   * Note: status, startDate and expirationDate are driven by asDraft/asActive/asArchived.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted version (id null)
   * @param {SCOPES} [params.scope] - certification scope, defaults to Frameworks.CORE
   * @param {number} [params.assessmentDuration] - in minutes
   * @param {number} [params.minimumAnswersRequiredForValidation]
   * @param {number} [params.maximumAssessmentLength]
   * @param {number} [params.challengesBetweenSameCompetence]
   * @param {number} [params.defaultProbabilityToPickChallenge]
   * @param {number} [params.defaultCandidateCapacity]
   * @param {number} [params.variationPercent]
   * @param {boolean} [params.limitToOneQuestionPerTube]
   * @param {boolean} [params.enablePassageByAllCompetences]
   * @param {string} [params.comments]
   * @returns {VersionDetailsBuilder}
   */
  withParameters({
    id,
    scope,
    assessmentDuration,
    minimumAnswersRequiredForValidation,
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    defaultProbabilityToPickChallenge,
    defaultCandidateCapacity,
    variationPercent,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    comments,
  } = {}) {
    this.id = id ?? this.id;
    this.scope = scope ?? this.scope;
    this.assessmentDuration = assessmentDuration ?? this.assessmentDuration;
    this.minimumAnswersRequiredForValidation =
      minimumAnswersRequiredForValidation ?? this.minimumAnswersRequiredForValidation;
    this.maximumAssessmentLength = maximumAssessmentLength ?? this.maximumAssessmentLength;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence ?? this.challengesBetweenSameCompetence;
    this.defaultProbabilityToPickChallenge =
      defaultProbabilityToPickChallenge ?? this.defaultProbabilityToPickChallenge;
    this.defaultCandidateCapacity = defaultCandidateCapacity ?? this.defaultCandidateCapacity;
    this.variationPercent = variationPercent ?? this.variationPercent;
    this.limitToOneQuestionPerTube = limitToOneQuestionPerTube || this.limitToOneQuestionPerTube;
    this.enablePassageByAllCompetences = enablePassageByAllCompetences || this.enablePassageByAllCompetences;
    this.comments = comments ?? this.comments;
    return this;
  }

  /**
   * Inserts corresponding certification_version row, certification_versions_tubes rows and init corresponding learning content
   * then returns the built domain VersionDetails carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {VersionDetails} the persisted version
   */
  insertToDB({ databaseBuilder }) {
    const versionDetails = this.build();

    const row = databaseBuilder.factory.buildCertificationVersion({
      id: versionDetails.id ?? undefined,
      scope: versionDetails.scope,
      startDate: versionDetails.startDate,
      expirationDate: versionDetails.expirationDate,
      assessmentDuration: versionDetails.assessmentDuration,
      minimumAnswersRequiredToValidateACertification: versionDetails.minimumAnswersRequiredForValidation,
      globalScoringConfiguration: defaultGlobalScoringConfiguration,
      competencesScoringConfiguration: defaultCompetencesScoringConfiguration,
      challengesConfiguration: {
        maximumAssessmentLength: versionDetails.maximumAssessmentLength,
        challengesBetweenSameCompetence: versionDetails.challengesBetweenSameCompetence,
        defaultProbabilityToPickChallenge: versionDetails.defaultProbabilityToPickChallenge,
        defaultCandidateCapacity: versionDetails.defaultCandidateCapacity,
        variationPercent: versionDetails.variationPercent,
        limitToOneQuestionPerTube: versionDetails.limitToOneQuestionPerTube,
        enablePassageByAllCompetences: versionDetails.enablePassageByAllCompetences,
      },
      status: versionDetails.status,
      comments: versionDetails.comments,
    });

    const tubeIds = this.#insertLearningContentToDB({ databaseBuilder, areas: this.areas });

    for (const tubeId of tubeIds) {
      databaseBuilder.factory.buildCertificationVersionTube({
        versionId: row.id,
        tubeId,
      });
    }

    this.id = row.id;
    return this.build();
  }

  insertLearningContentToDB({ databaseBuilder, areas }) {
    this.#insertLearningContentToDB({ databaseBuilder, areas });
  }

  #insertLearningContentToDB({ databaseBuilder, areas }) {
    const tubeIds = [];
    for (const area of areas) {
      databaseBuilder.factory.learningContent.buildFramework({
        id: area.frameworkId,
      });
      const competenceIds = area.competences.map((competence) => competence.id);
      databaseBuilder.factory.learningContent.buildArea({
        ...area,
        competenceIds,
        title_i18n: { fr: area.title },
      });
      for (const competence of area.competences) {
        databaseBuilder.factory.learningContent.buildCompetence({
          ...competence,
          areaId: area.id,
          name_i18n: { fr: competence.name },
        });
        for (const thematic of competence.thematics) {
          databaseBuilder.factory.learningContent.buildThematic({
            ...thematic,
            competenceId: competence.id,
            name_i18n: { fr: thematic.name },
          });
          for (const tube of thematic.tubes) {
            const skillIds = tube.skills.map((skill) => skill.id);
            databaseBuilder.factory.learningContent.buildTube({
              ...tube,
              thematicId: thematic.id,
              competenceId: competence.id,
              practicalTitle_i18n: { fr: tube.practicalTitle },
              isMobileCompliant: tube.mobile,
              isTabletCompliant: tube.tablet,
              skillIds,
            });
            tubeIds.push(tube.id);
            for (const skill of tube.skills) {
              databaseBuilder.factory.learningContent.buildSkill({
                ...skill,
                tubeId: tube.id,
                level: skill.difficulty,
              });
            }
          }
        }
      }
    }
    return tubeIds;
  }

  /**
   * Materializes the domain VersionDetails without touching the database.
   *
   * @returns {VersionDetails}
   */
  build() {
    return new VersionDetails({
      id: this.id,
      scope: this.scope,
      startDate: this.startDate,
      expirationDate: this.expirationDate,
      assessmentDuration: this.assessmentDuration,
      minimumAnswersRequiredForValidation: this.minimumAnswersRequiredForValidation,
      maximumAssessmentLength: this.maximumAssessmentLength,
      challengesBetweenSameCompetence: this.challengesBetweenSameCompetence,
      defaultProbabilityToPickChallenge: this.defaultProbabilityToPickChallenge,
      defaultCandidateCapacity: this.defaultCandidateCapacity,
      variationPercent: this.variationPercent,
      limitToOneQuestionPerTube: this.limitToOneQuestionPerTube,
      enablePassageByAllCompetences: this.enablePassageByAllCompetences,
      comments: this.comments,
      status: this.status,
      areas: this.areas,
    });
  }
}

/**
 * Entry point of the fluent VersionDetails builder. Returns the builder, NOT a VersionDetails:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {VersionDetailsBuilder}
 */
export function versionDetailsBuilder() {
  return new VersionDetailsBuilder();
}
