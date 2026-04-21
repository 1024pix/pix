import 'dayjs/locale/fr.js';

import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { disconnect as disconnectKnex } from '../../db/knex-database-connection.js';
import * as tutorialRepository from '../../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import * as missionRepository from '../../src/school/infrastructure/repositories/mission-repository.js';
import { featureToggles } from '../../src/shared/infrastructure/feature-toggles/index.js';
import { JobClient } from '../../src/shared/infrastructure/jobs/JobClient.js';
import { clearMutex, quitMutex } from '../../src/shared/infrastructure/mutex/RedisMutex.js';
import * as areaRepository from '../../src/shared/infrastructure/repositories/area-repository.js';
import * as challengeRepository from '../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../src/shared/infrastructure/repositories/course-repository.js';
import * as frameworkRepository from '../../src/shared/infrastructure/repositories/framework-repository.js';
import * as skillRepository from '../../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../src/shared/infrastructure/repositories/tube-repository.js';
import * as customChaiHelpers from './chai-custom-helpers/index.js';
import { jobChai } from './chai-custom-helpers/jobs/expect-job.js';
import { databaseBuilder, datamartBuilder } from './databases.js';

// Init Dayjs configuration
dayjs.extend(localizedFormat);

// Extends Chai helpers
use(chaiAsPromised);
use(sinonChai);
use(jobChai);
Object.values(customChaiHelpers).forEach(use);

// Setup expect globally
global.expect = expect;

export async function mochaGlobalSetup() {
  nock.disableNetConnect();
  nock.enableNetConnect('localhost:9090'); // Unmock S3 storage
  await JobClient.instance.initialize();
}

export async function mochaGlobalTeardown() {
  await JobClient.instance.stop();
  await quitMutex();
  await disconnectKnex();
}

export const mochaHooks = {
  async afterEach() {
    sinon.restore();
    nock.cleanAll();
    frameworkRepository.clearCache();
    areaRepository.clearCache();
    competenceRepository.clearCache();
    thematicRepository.clearCache();
    tubeRepository.clearCache();
    skillRepository.clearCache();
    challengeRepository.clearCache();
    courseRepository.clearCache();
    tutorialRepository.clearCache();
    missionRepository.clearCache();
    await featureToggles.resetDefaults();
    await clearMutex();
    await JobClient.instance.flushJobs();
    await datamartBuilder.clean();
    await databaseBuilder.clean();
  },
};
