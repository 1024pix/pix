import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { knex } from '../../../../db/knex-database-connection.js';
import * as complementaryCertificationBadgeRepository from '../../../certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as badgeRepository from '../../../evaluation/infrastructure/repositories/badge-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { LcmsRefreshCacheJob } from '../../infrastructure/jobs/lcms/LcmsRefreshCacheJob.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  complementaryCertificationBadgeRepository,
  badgeRepository,
  lcmsRefreshCacheJob: new LcmsRefreshCacheJob(knex),
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { sharedUsecases };
