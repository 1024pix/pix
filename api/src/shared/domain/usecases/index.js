import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as thematicRepository from '../../../../lib/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';
import * as complementaryCertificationBadgeRepository from '../../../certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as badgeRepository from '../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as frameworkRepository from '../../../shared/infrastructure/repositories/framework-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { lcmsRefreshCacheJobRepository } from '../../infrastructure/repositories/jobs/lcms-refresh-cache-job-repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  complementaryCertificationBadgeRepository,
  lcmsRefreshCacheJobRepository,
  badgeRepository,
  areaRepository,
  frameworkRepository,
  tubeRepository,
  skillRepository,
  thematicRepository,
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { sharedUsecases };
