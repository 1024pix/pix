import nock from 'nock';

import * as moduleRepository from '../../src/devcomp/infrastructure/repositories/module-repository.js';
import * as tutorialRepository from '../../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import * as missionRepository from '../../src/school/infrastructure/repositories/mission-repository.js';
import { featureToggles } from '../../src/shared/infrastructure/feature-toggles/index.js';
import { JobClient } from '../../src/shared/infrastructure/jobs/JobClient.js';
import { clearMutex } from '../../src/shared/infrastructure/mutex/RedisMutex.js';
import { releaseInfrastructure } from '../../src/shared/infrastructure/release-infrastructure.js';
import * as areaRepository from '../../src/shared/infrastructure/repositories/area-repository.js';
import * as challengeRepository from '../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../src/shared/infrastructure/repositories/course-repository.js';
import * as skillRepository from '../../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../src/shared/infrastructure/repositories/tube-repository.js';
import { databaseBuilder, datamartBuilder } from '../tooling/databases.js';
import { mochaHooks as commonHooks } from './common.js';

export const mochaHooks = {
  async beforeAll() {
    // Always start tests with a clean database
    await databaseBuilder.emptyDatabase();

    nock.disableNetConnect();
    nock.enableNetConnect('localhost:9090'); // Unmock S3 storage

    await JobClient.instance.initialize({ worker: true, isTestOnly: true });
  },

  afterEach: [
    commonHooks.afterEach,
    async function () {
      nock.cleanAll();
      areaRepository.clearCache();
      competenceRepository.clearCache();
      thematicRepository.clearCache();
      tubeRepository.clearCache();
      skillRepository.clearCache();
      challengeRepository.clearCache();
      courseRepository.clearCache();
      tutorialRepository.clearCache();
      missionRepository.clearCache();
      moduleRepository.clearCache();
      await featureToggles.resetDefaults();
      await clearMutex();
      await JobClient.instance.flushJobs();
      await datamartBuilder.clean();
      await databaseBuilder.clean();
    },
  ],

  async afterAll() {
    await releaseInfrastructure();
  },
};
