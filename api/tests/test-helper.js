import 'dayjs/locale/fr.js';

import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import * as moduleRepository from '../src/devcomp/infrastructure/repositories/module-repository.js';
import * as tutorialRepository from '../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import * as missionRepository from '../src/school/infrastructure/repositories/mission-repository.js';
import { featureToggles } from '../src/shared/infrastructure/feature-toggles/index.js';
import { JobClient } from '../src/shared/infrastructure/jobs/JobClient.js';
import { clearMutex } from '../src/shared/infrastructure/mutex/RedisMutex.js';
import { releaseInfrastructure } from '../src/shared/infrastructure/release-infrastructure.js';
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

// Mocha's `context()` alias for `describe()` is used ~5,200 times across the suite;
// vitest doesn't provide it, so it's shimmed globally rather than rewriting every call site.
globalThis.context = describe;

// setupFiles re-run their top-level code before every test file, so a `globalThis` guard (not a
// module-scoped variable, which could get a fresh binding on each re-execution) is needed to
// reproduce mocha's "runs once for the whole process" root `before()` semantics.
beforeAll(async function () {
  if (globalThis.__testHelperInitialized) return;
  globalThis.__testHelperInitialized = true;

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

// `afterAll` would run after every file, not just the last one — since the shared knex pool and
// JobClient singleton must survive until the very last test, teardown is tied to the process
// itself (safe because fileParallelism:false/isolate:false guarantee a single persistent process
// for the whole run) rather than to vitest's per-file hook lifecycle.
//
// Empirically verified (not `beforeExit`, which never fires here): vitest terminates a
// `pool: 'forks'` worker by sending it SIGTERM/SIGINT once the run is done, without ever letting
// the event loop drain naturally. An async handler that calls `process.exit()` at the end is
// correctly awaited before the process actually dies.
async function teardown() {
  await quitMutex();
  try {
    await JobClient.instance.stop();
  } catch {
    // pgBoss is not available on unit tests
  }
  await disconnectKnex();
  // eslint-disable-next-line n/no-process-exit
  process.exit(0);
}

if (!globalThis.__testHelperTeardownRegistered) {
  globalThis.__testHelperTeardownRegistered = true;
  process.once('SIGTERM', teardown);
  process.once('SIGINT', teardown);
}

export { expect };
