import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as groupRepository from '../../../../../lib/infrastructure/repositories/group-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as organizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository.js';
import * as scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
import * as supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';

const dependencies = {
  groupRepository,
  supOrganizationParticipantRepository,
  scoOrganizationParticipantRepository,
  organizationParticipantRepository,
  organizationLearnerActivityRepository,
  organizationLearnerRepository,
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
