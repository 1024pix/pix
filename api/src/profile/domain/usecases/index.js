import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as competenceEvaluationRepository from '../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as profileRewardRepository from '../../../profile/infrastructure/repositories/profile-reward-repository.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  profileRewardRepository,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
