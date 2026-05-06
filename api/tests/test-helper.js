import 'dayjs/locale/fr.js';

import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { disconnect as disconnectKnex } from '../db/knex-database-connection.js';
import * as moduleRepository from '../src/devcomp/infrastructure/repositories/module-repository.js';
import * as tutorialRepository from '../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import * as missionRepository from '../src/school/infrastructure/repositories/mission-repository.js';
import { featureToggles } from '../src/shared/infrastructure/feature-toggles/index.js';
import { JobClient } from '../src/shared/infrastructure/jobs/JobClient.js';
import { clearMutex, quitMutex } from '../src/shared/infrastructure/mutex/RedisMutex.js';
import * as areaRepository from '../src/shared/infrastructure/repositories/area-repository.js';
import * as challengeRepository from '../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../src/shared/infrastructure/repositories/course-repository.js';
import * as skillRepository from '../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../src/shared/infrastructure/repositories/tube-repository.js';
import * as customChaiHelpers from './tooling/chai-custom-helpers/index.js';
import { jobChai } from './tooling/chai-custom-helpers/jobs/expect-job.js';
import { databaseBuilder, datamartBuilder } from './tooling/databases.js';

// Init Dayjs configuration
dayjs.extend(localizedFormat);

// Extends Chai helpers
chaiUse(chaiAsPromised);
chaiUse(sinonChai);
chaiUse(jobChai);
Object.values(customChaiHelpers).forEach(chaiUse);

/* eslint-disable mocha/no-top-level-hooks */
before(async function () {
  nock.disableNetConnect();
  nock.enableNetConnect('localhost:9090'); // Unmock S3 storage

  try {
    await JobClient.instance.initialize({ worker: true, isTestOnly: true });
  } catch {
    // pgBoss is not available on unit tests
  }
});

afterEach(async function () {
  sinon.restore();
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
  try {
    await JobClient.instance.flushJobs();
  } catch {
    // pgBoss is not available on unit tests
  }
  await datamartBuilder.clean();
  await databaseBuilder.clean();
});

after(async function () {
  await quitMutex();
  try {
    await JobClient.instance.stop();
  } catch {
    // pgBoss is not available on unit tests
  }
  await disconnectKnex();
});
/* eslint-enable mocha/no-top-level-hooks */

// eslint-disable-next-line mocha/no-exports
export { expect };
