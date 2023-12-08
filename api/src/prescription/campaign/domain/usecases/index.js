import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as campaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import * as campaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository.js';
import * as campaignReportRepository from '../../infrastructure/repositories/campaign-report-repository.js';

import * as badgeRepository from '../../../../shared/infrastructure/repositories/badge-repository.js';
import * as stageCollectionRepository from '../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as codeGenerator from '../../../../../lib/domain/services/code-generator.js';
import * as membershipRepository from '../../../../../lib/infrastructure/repositories/membership-repository.js';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  campaignAdministrationRepository,
  campaignCreatorRepository,
  campaignReportRepository,
  badgeRepository,
  stageCollectionRepository,
  codeGenerator,
  membershipRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
