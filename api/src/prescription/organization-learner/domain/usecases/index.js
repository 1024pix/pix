import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as campaignParticipationOverviewRepository from '../../../../../lib/infrastructure/repositories/campaign-participation-overview-repository.js';
/** TODO
 * Internal API Needed For
 * campaignRepository.getByCode
 * groupRepository.findByOrganizationId
 */
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as libOrganizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import * as organizationFeaturesAPI from '../../../../organizational-entities/application/api/organization-features-api.js';
import { tagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as divisionRepository from '../../../campaign/infrastructure/repositories/division-repository.js';
import * as groupRepository from '../../../campaign/infrastructure/repositories/group-repository.js';
import * as organizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import * as organizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository.js';
import * as registrationOrganizationLearnerRepository from '../../infrastructure/repositories/registration-organization-learner-repository.js';
import * as scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
import * as supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';

const dependencies = {
  divisionRepository,
  groupRepository,
  supOrganizationParticipantRepository,
  scoOrganizationParticipantRepository,
  libOrganizationLearnerRepository,
  organizationRepository,
  organizationParticipantRepository,
  organizationLearnerActivityRepository,
  organizationLearnerRepository,
  organizationLearnerImportFormatRepository,
  organizationFeaturesAPI,
  campaignRepository,
  campaignParticipationOverviewRepository,
  registrationOrganizationLearnerRepository,
  tagRepository,
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
