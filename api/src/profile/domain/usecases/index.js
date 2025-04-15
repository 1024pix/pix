import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as competenceEvaluationRepository from '../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import { repositories } from '../../../profile/infrastructure/repositories/index.js';
import * as profileRewardRepository from '../../../profile/infrastructure/repositories/profile-reward-repository.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import * as stringUtils from '../../../shared/infrastructure/utils/string-utils.js';
import * as attestationRepository from '../../infrastructure/repositories/attestation-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as organizationProfileRewardRepository from '../../infrastructure/repositories/organization-profile-reward-repository.js';
import * as rewardRepository from '../../infrastructure/repositories/reward-repository.js';

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
  userRepository: repositories.userRepository,
  organizationProfileRewardRepository,
  attestationRepository,
  rewardRepository,
  campaignParticipationRepository,
  stringUtils,
  PromiseUtils,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
