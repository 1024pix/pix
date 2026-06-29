import _ from 'lodash';

import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { createVersion, linkChallengesAndVersionFromTubeIds } from '../tools/certification-version.js';
import { UnseedableError } from './UnseedableError.js';
/**
 * @property {{ expiredVersionId: string, currentVersionId: string }} coreVersion
 * @property {{ currentVersionId: string }} pixPlusDroitVersion
 * @property {{ currentVersionId: string }} pixPlusEdu1erDegreVersion
 * @property {{ currentVersionId: string }} pixPlusEdu2ndDegreVersion
 */
export class CommonCertificationVersions {
  static #NUMBER_OF_CHALLENGES_PER_VERSION = 100;

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   */
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @returns {Promise<void>}
   */
  static async initCoreVersions({ databaseBuilder }) {
    try {
      if (!this.coreVersion) {
        this.coreVersion = {};

        this.coreVersion.expiredVersionId = await this.#createExpiredCoreVersion({
          databaseBuilder,
        });

        const coreFrameworkName = 'Pix';
        this.coreVersion.currentVersionId = await this.#createActiveFrameworkVersion({
          databaseBuilder,
          fromLcmsFrameworkName: coreFrameworkName,
          toFrameworkScope: SCOPES.CORE,
        });
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnseedableError('Could not find Pix referential', error);
      }
      this.coreVersion = null;
      throw error;
    }
  }

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @returns {Promise<void>}
   */
  static async initPixPlusDroitVersion({ databaseBuilder }) {
    try {
      if (!this.pixPlusDroitVersion) {
        this.pixPlusDroitVersion = {};

        const pixPlusDroitFrameworkName = 'Droit';

        const challengeIds = await this.#getChallengeIdsByFramework({
          databaseBuilder,
          frameworkName: pixPlusDroitFrameworkName,
        });

        const currentVersion = await createVersion({
          databaseBuilder,
          status: 'ACTIVE',
          scope: SCOPES.PIX_PLUS_DROIT,
          assessmentDuration: 60,
          challengesConfiguration: CHALLENGES_CONFIGURATION,
          globalScoringConfiguration: [
            { bounds: { max: 0, min: -2.33 }, meshLevel: 0 },
            { bounds: { max: 2.33, min: 0 }, meshLevel: 1 },
            { bounds: { max: 4.67, min: 2.33 }, meshLevel: 2 },
            { bounds: { max: 8, min: 4.67 }, meshLevel: 3 },
          ],
          competencesScoringConfiguration: null,
        });
        await linkChallengesAndVersionFromTubeIds({ databaseBuilder, challengeIds, versionId: currentVersion.id });

        await this.#simulateCalibration({ databaseBuilder, versionId: currentVersion.id });
        this.pixPlusDroitVersion.currentVersionId = currentVersion.id;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnseedableError('Could not find Droit referential', error);
      }
      this.coreVersion = null;
      throw error;
    }
  }

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @returns {Promise<void>}
   */
  static async initPixPlusEdu1erDegreVersion({ databaseBuilder }) {
    try {
      if (!this.pixPlusEdu1erDegreVersion) {
        this.pixPlusEdu1erDegreVersion = {};

        const pixPlusEdu1erDegreFrameworkName = 'Edu';

        const challengeIds = await this.#getChallengeIdsByFramework({
          databaseBuilder,
          frameworkName: pixPlusEdu1erDegreFrameworkName,
        });

        const currentVersion = await createVersion({
          databaseBuilder,
          status: 'ACTIVE',
          scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
          assessmentDuration: 90,
          challengesConfiguration: CHALLENGES_CONFIGURATION,
          globalScoringConfiguration: [{ bounds: { max: 8, min: 1 }, meshLevel: 0 }],
          competencesScoringConfiguration: null,
        });

        await linkChallengesAndVersionFromTubeIds({ databaseBuilder, challengeIds, versionId: currentVersion.id });

        await this.#simulateCalibration({ databaseBuilder, versionId: currentVersion.id });

        this.pixPlusEdu1erDegreVersion.currentVersionId = currentVersion.id;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnseedableError('Could not find Edu referential', error);
      }
      this.coreVersion = null;
      throw error;
    }
  }

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @returns {Promise<void>}
   */
  static async initPixPlusEdu2ndDegreVersion({ databaseBuilder }) {
    try {
      if (!this.pixPlusEdu2ndDegreVersion) {
        this.pixPlusEdu2ndDegreVersion = {};

        const pixPlusEdu2ndDegreFrameworkName = 'Edu';
        const challengeIds = await this.#getChallengeIdsByFramework({
          databaseBuilder,
          frameworkName: pixPlusEdu2ndDegreFrameworkName,
        });

        const currentVersion = await createVersion({
          databaseBuilder,
          status: 'ACTIVE',
          scope: SCOPES.PIX_PLUS_EDU_2ND_DEGRE,
          assessmentDuration: 90,
          challengesConfiguration: CHALLENGES_CONFIGURATION,
          globalScoringConfiguration: [{ bounds: { max: 8, min: 1 }, meshLevel: 0 }],
          competencesScoringConfiguration: null,
        });

        await linkChallengesAndVersionFromTubeIds({ databaseBuilder, challengeIds, versionId: currentVersion.id });

        await this.#simulateCalibration({ databaseBuilder, versionId: currentVersion.id });

        this.pixPlusEdu2ndDegreVersion.currentVersionId = currentVersion.id;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnseedableError('Could not find Edu 2nd degré referential', error);
      }
      this.pixPlusEdu2ndDegreVersion = null;
      throw error;
    }
  }

  /**
   * @param {Object} params
   * @param {string} params.frameworkName
   * @returns {Promise<Array<string>>}
   */
  static async #getChallengeIdsByFramework({ databaseBuilder, frameworkName }) {
    await databaseBuilder.commit();
    const challengeIds = await databaseBuilder
      .knex({ frameworks: 'learningcontent.frameworks' })
      .pluck('challenges.id')
      .join({ areas: 'learningcontent.areas' }, 'areas.frameworkId', 'frameworks.id')
      .join({ competences: 'learningcontent.competences' }, 'competences.areaId', 'areas.id')
      .join({ skills: 'learningcontent.skills' }, 'skills.competenceId', 'competences.id')
      .join({ challenges: 'learningcontent.challenges' }, 'challenges.skillId', 'skills.id')
      .where('frameworks.name', frameworkName === SCOPES.CORE ? 'Pix' : frameworkName)
      .whereRaw('?=ANY(??)', [FRENCH_SPOKEN, 'challenges.locales']);

    const result = _.sampleSize(challengeIds, CommonCertificationVersions.#NUMBER_OF_CHALLENGES_PER_VERSION);
    return result;
  }

  /**
   * Sadly the usecase calibrateFrameworkVersion has a dependency on the datamart
   * That would make it very hard to use for seeding
   */
  static async #simulateCalibration({ databaseBuilder, versionId }) {
    await databaseBuilder.commit();
    const algoConfiguration = await databaseBuilder
      .knex('certification_versions')
      .select('challengesConfiguration', 'globalScoringConfiguration')
      .where('id', versionId)
      .first();

    const challengeIds = await databaseBuilder
      .knex('certification-frameworks-challenges')
      .select('challengeId')
      .where('versionId', versionId)
      .pluck('challengeId');

    const { min, max } = this.#getCapacityBounds(algoConfiguration.globalScoringConfiguration);

    for (const challengeId of challengeIds) {
      const difficulty = Math.random() * (max - min) + min;
      await databaseBuilder.knex('certification-frameworks-challenges').where('challengeId', challengeId).update({
        discriminant: algoConfiguration.challengesConfiguration.variationPercent,
        difficulty,
      });
    }
  }

  static #getCapacityBounds(globalScoringConfiguration) {
    const meshLevels = globalScoringConfiguration.map((config) => config.meshLevel);
    const minMeshLevel = Math.min(...meshLevels);
    const maxMeshLevel = Math.max(...meshLevels);

    const minBound = globalScoringConfiguration.find((config) => config.meshLevel === minMeshLevel).bounds.min;
    const maxBound = globalScoringConfiguration.find((config) => config.meshLevel === maxMeshLevel).bounds.max;

    return { min: minBound, max: maxBound };
  }

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @returns {Promise<number>}
   */
  static async #createExpiredCoreVersion({ databaseBuilder }) {
    const expiredVersion = await createVersion({
      databaseBuilder,
      status: 'ARCHIVED',
      scope: SCOPES.CORE,
      assessmentDuration: 105,
      challengesConfiguration: CHALLENGES_CONFIGURATION,
      globalScoringConfiguration: [{ bounds: { max: 8, min: 1 }, meshLevel: 0 }],
      competencesScoringConfiguration: null,
    });
    await linkChallengesAndVersionFromTubeIds({ databaseBuilder, challengeIds: [], versionId: expiredVersion.id });

    await databaseBuilder.commit();

    return expiredVersion.id;
  }

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @param {string} params.fromLcmsFrameworkName
   * @param {SCOPES} params.toFrameworkScope
   * @returns {Promise<number>}
   */
  static async #createActiveFrameworkVersion({ databaseBuilder, fromLcmsFrameworkName, toFrameworkScope }) {
    const challengeIds = await this.#getChallengeIdsByFramework({
      databaseBuilder,
      frameworkName: fromLcmsFrameworkName,
    });

    let assessmentDuration;
    switch (toFrameworkScope) {
      case SCOPES.PIX_PLUS_PRO_SANTE:
      case SCOPES.PIX_PLUS_DROIT:
        assessmentDuration = 60;
        break;
      case SCOPES.PIX_PLUS_EDU_1ER_DEGRE:
      case SCOPES.PIX_PLUS_EDU_2ND_DEGRE:
      case SCOPES.PIX_PLUS_EDU_CPE:
        assessmentDuration = 90;
        break;
      default:
        assessmentDuration = DEFAULT_SESSION_DURATION_MINUTES;
        break;
    }

    const currentVersion = await createVersion({
      databaseBuilder,
      status: 'ACTIVE',
      scope: toFrameworkScope,
      assessmentDuration,
      challengesConfiguration: CHALLENGES_CONFIGURATION,
      globalScoringConfiguration: GLOBAL_SCORING_CONFIGURATION,
      competencesScoringConfiguration: COMPETENCES_SCORING_CONFIGURATION,
    });
    await linkChallengesAndVersionFromTubeIds({ databaseBuilder, challengeIds, versionId: currentVersion.id });

    await this.#simulateCalibration({ databaseBuilder, versionId: currentVersion.id });

    return currentVersion.id;
  }
}

const CHALLENGES_CONFIGURATION = {
  maximumAssessmentLength: 32,
  challengesBetweenSameCompetence: 2,
  limitToOneQuestionPerTube: true,
  enablePassageByAllCompetences: true,
  variationPercent: 0.5,
  defaultCandidateCapacity: -3,
  defaultProbabilityToPickChallenge: 51,
};

const GLOBAL_SCORING_CONFIGURATION = [
  {
    meshLevel: 0,
    bounds: {
      min: -4.67,
      max: -1.4,
    },
  },
  {
    meshLevel: 1,
    bounds: {
      min: -1.4,
      max: -0.519,
    },
  },
  {
    meshLevel: 2,
    bounds: {
      min: -0.519,
      max: 0.6,
    },
  },
  {
    meshLevel: 3,
    bounds: {
      min: 0.6,
      max: 1.5,
    },
  },
  {
    meshLevel: 4,
    bounds: {
      min: 1.5,
      max: 2.25,
    },
  },
  {
    meshLevel: 5,
    bounds: {
      min: 2.25,
      max: 3.1,
    },
  },
  {
    meshLevel: 6,
    bounds: {
      min: 3.1,
      max: 4,
    },
  },
  {
    meshLevel: 7,
    bounds: {
      min: 4,
      max: 8,
    },
  },
];

const COMPETENCES_SCORING_CONFIGURATION = [
  {
    competence: '1.1',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '1.2',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '1.3',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '2.1',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '2.2',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '2.3',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '2.4',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '3.1',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '3.2',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '3.3',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '3.4',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '4.1',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '4.2',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '4.3',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '5.1',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
  {
    competence: '5.2',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
];
