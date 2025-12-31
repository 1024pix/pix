import dayjs from 'dayjs';
import _ from 'lodash';

import { usecases as configurationUsecases } from '../../../../../src/certification/configuration/domain/usecases/index.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { usecases as learningContentUsecases } from '../../../../../src/learning-content/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { UnseedableError } from './UnseedableError.js';

/**
 * @property {{ expiredVersionId: string, currentVersionId: string }} coreVersion
 * @property {{ currentVersionId: string }} pixPlusDroitVersion
 * @property {{ currentVersionId: string }} pixPlusEdu1erDegreVersion
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
        this.pixPlusDroitVersion.currentVersionId = await this.#createActiveFrameworkVersion({
          databaseBuilder,
          fromLcmsFrameworkName: pixPlusDroitFrameworkName,
          toFrameworkScope: SCOPES.PIX_PLUS_DROIT,
        });
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
        this.pixPlusEdu1erDegreVersion.currentVersionId = await this.#createActiveFrameworkVersion({
          databaseBuilder,
          fromLcmsFrameworkName: pixPlusEdu1erDegreFrameworkName,
          toFrameworkScope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
        });
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
   * @param {string} params.frameworkName
   * @returns {Promise<Array<number>>}
   */
  static async #getTubeIdsByFramework({ frameworkName }) {
    const areas = await learningContentUsecases.getFrameworkAreas({
      frameworkName,
      locale: FRENCH_SPOKEN,
    });

    const allTubeIds = areas.flatMap((area) =>
      area.competences.flatMap((competence) =>
        competence.thematics.flatMap((thematic) => thematic.tubes.map((tube) => tube.id)),
      ),
    );

    return _.sampleSize(allTubeIds, CommonCertificationVersions.#NUMBER_OF_CHALLENGES_PER_VERSION);
  }

  /**
   * This does not exist as a feature as of today (current feature still using certification-configurations table)
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @param {number} params.versionId
   * @returns {Promise<void>}
   */
  static async #forceConfigurations({ databaseBuilder, versionId }) {
    await databaseBuilder
      .knex('certification_versions')
      .where('id', versionId)
      .update({
        challengesConfiguration: JSON.stringify(CHALLENGES_CONFIGURATION),
        globalScoringConfiguration: JSON.stringify(GLOBAL_SCORING_CONFIGURATION),
        competencesScoringConfiguration: JSON.stringify(COMPETENCES_SCORING_CONFIGURATION),
      });
    await databaseBuilder.commit();
  }

  /**
   * Sadly the usecase calibrateFrameworkVersion has a dependency on the datamart
   * That would make it very hard to use for seeding
   */
  static async #simulateCalibration({ databaseBuilder, versionId }) {
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
    const expiredVersionId = await configurationUsecases.createCertificationVersion({
      scope: SCOPES.CORE,
      tubeIds: [],
    });

    // Allows for an easier identification during tests, and represents a "more real" versioning
    await databaseBuilder
      .knex('certification_versions')
      .where('id', expiredVersionId)
      .update({
        startDate: dayjs().subtract(1, 'year').toDate(),
      });

    await databaseBuilder.commit();

    return expiredVersionId;
  }

  /**
   * @param {Object} params
   * @param {Knex} params.databaseBuilder
   * @returns {Promise<number>}
   */
  static async #createActiveFrameworkVersion({ databaseBuilder, fromLcmsFrameworkName, toFrameworkScope }) {
    const tubeIds = await this.#getTubeIdsByFramework({ frameworkName: fromLcmsFrameworkName });
    const currentVersionId = await configurationUsecases.createCertificationVersion({
      scope: toFrameworkScope,
      tubeIds,
    });

    await this.#forceConfigurations({
      databaseBuilder,
      versionId: currentVersionId,
    });

    await this.#simulateCalibration({ databaseBuilder, versionId: currentVersionId });

    await databaseBuilder.commit();

    return currentVersionId;
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
      min: -8,
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
