import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as campaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import * as campaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository.js';
// TODO : clean with campaign administration ( similar get with a lot difference)
import * as campaignManagementRepository from '../../infrastructure/repositories/campaign-management-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as campaignParticipationInfoRepository from '../../infrastructure/repositories/campaign-participation-info-repository.js';
import * as campaignReportRepository from '../../infrastructure/repositories/campaign-report-repository.js';
import * as campaignProfilesCollectionParticipationSummaryRepository from '../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js';
import * as campaignAssessmentParticipationResultListRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-list-repository.js';
import * as targetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import { campaignParticipantActivityRepository } from '../../infrastructure/repositories/campaign-participant-activity-repository.js';

import * as campaignCsvExportService from '../services/campaign-csv-export-service.js';
import * as campaignUpdateValidator from '../validators/campaign-update-validator.js';

import * as badgeRepository from '../../../../shared/infrastructure/repositories/badge-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as userRepository from '../../../../shared/infrastructure/repositories/user-repository.js';

import * as badgeAcquisitionRepository from '../../../../../lib/infrastructure/repositories/badge-acquisition-repository.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as codeGenerator from '../../../../../lib/domain/services/code-generator.js';
import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as learningContentRepository from '../../../../../lib/infrastructure/repositories/learning-content-repository.js';
import * as membershipRepository from '../../../../../lib/infrastructure/repositories/membership-repository.js';
import * as organizationRepository from '../../../../../lib/infrastructure/repositories/organization-repository.js';
import * as placementProfileService from '../../../../../lib/domain/services/placement-profile-service.js';
import * as stageCollectionRepository from '../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  badgeAcquisitionRepository,
  badgeRepository,
  campaignRepository,
  campaignAdministrationRepository,
  campaignManagementRepository,
  campaignCreatorRepository,
  campaignCsvExportService,
  campaignParticipantActivityRepository,
  campaignParticipationRepository,
  campaignProfilesCollectionParticipationSummaryRepository,
  campaignParticipationInfoRepository,
  campaignReportRepository,
  campaignAssessmentParticipationResultListRepository,
  codeGenerator,
  campaignUpdateValidator,
  competenceRepository,
  knowledgeElementRepository,
  learningContentRepository,
  membershipRepository,
  organizationRepository,
  placementProfileService,
  stageCollectionRepository,
  targetProfileRepository, // TODO
  userRepository,
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
