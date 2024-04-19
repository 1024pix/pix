import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository.js';
import * as targetProfileTrainingRepository from '../../../../lib/infrastructure/repositories/target-profile-training-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as userRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { repositories } from '../../infrastructure/repositories/index.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  ...repositories,
  campaignRepository,
  campaignParticipationRepository,
  knowledgeElementRepository,
  targetProfileRepository,
  targetProfileTrainingRepository,
  skillRepository,
  userRepository,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
