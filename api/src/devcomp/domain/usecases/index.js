import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  ...repositories,
  campaignRepository,
  campaignParticipationRepository,
  knowledgeElementRepository,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
