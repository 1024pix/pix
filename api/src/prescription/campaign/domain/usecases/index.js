import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as learningContentRepository from '../../../../../lib/infrastructure/repositories/learning-content-repository.js';
import * as stageCollectionRepository from '../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as campaignRepository from '../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as tutorialRepository from '../../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as stageAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as stageRepository from '../../../../evaluation/infrastructure/repositories/stage-repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as codeGenerator from '../../../../shared/domain/services/code-generator.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as membershipRepository from '../../../../team/infrastructure/repositories/membership.repository.js';
import * as campaignAnalysisRepository from '../../../campaign-participation/infrastructure/repositories/campaign-analysis-repository.js';
import * as campaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as organizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import * as campaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import * as campaignAssessmentParticipationResultListRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-list-repository.js';
import * as campaignCollectiveResultRepository from '../../infrastructure/repositories/campaign-collective-result-repository.js';
import * as campaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository.js';
// TODO : clean with campaign administration ( similar get with a lot difference)
import * as campaignManagementRepository from '../../infrastructure/repositories/campaign-management-repository.js';
import { campaignParticipantActivityRepository } from '../../infrastructure/repositories/campaign-participant-activity-repository.js';
import * as campaignParticipationInfoRepository from '../../infrastructure/repositories/campaign-participation-info-repository.js';
import * as campaignParticipationsStatsRepository from '../../infrastructure/repositories/campaign-participations-stats-repository.js';
import * as campaignProfilesCollectionParticipationSummaryRepository from '../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js';
import * as campaignReportRepository from '../../infrastructure/repositories/campaign-report-repository.js';
import * as divisionRepository from '../../infrastructure/repositories/division-repository.js';
import * as groupRepository from '../../infrastructure/repositories/group-repository.js';
import { repositories as campaignRepositories } from '../../infrastructure/repositories/index.js';
import * as knowledgeElementSnapshotRepository from '../../infrastructure/repositories/knowledge-element-snapshot-repository.js';
import * as campaignMediaComplianceService from '../services/campaign-media-compliance-service.js';
import * as campaignUpdateValidator from '../validators/campaign-update-validator.js';

/**
 * @typedef { import ('../../../../../lib/infrastructure/repositories/badge-acquisition-repository.js')} BadgeAcquisitionRepository
 * @typedef { import ('../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js')} CampaignRepository
 * @typedef { import ('../../../../devcomp/infrastructure/repositories/tutorial-repository.js')} TutorialRepository
 * @typedef { import ('../../../../../lib/infrastructure/repositories/knowledge-element-repository.js')} KnowledgeElementRepository
 * @typedef { import ('../../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository.js')} KnowledgeElementSnapshotRepository
 * @typedef { import ('../../../../../lib/infrastructure/repositories/learning-content-repository.js')} LearningContentRepository
 * @typedef { import ('../../../../team/infrastructure/repositories/membership-repository.js')} MembershipRepository
 * @typedef { import ('../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js')} StageCollectionRepository
 * @typedef { import ('../../../../evaluation/infrastructure/repositories/badge-repository.js')} BadgeRepository
 * @typedef { import ('../../../../identity-access-management/infrastructure/repositories/user.repository.js')} UserRepository
 * @typedef { import ('../../../../organizational-entities/application/api/organization-features-api.js')} OrganizationFeatureApi
 * @typedef { import ('../../../../shared/domain/services/code-generator.js')} CodeGenerator
 * @typedef { import ('../../../../shared/domain/services/placement-profile-service.js')} PlacementProfileService
 * @typedef { import ('../../../../shared/infrastructure/repositories/competence-repository.js')} CompetenceRepository
 * @typedef { import ('../../../../shared/infrastructure/repositories/organization-repository.js')} OrganizationRepository
 * @typedef { import ('../../../campaign-participation/infrastructure/repositories/campaign-analysis-repository.js')} CampaignAnalysisRepository
 * @typedef { import ('../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js')} CampaignParticipationRepository
 * @typedef { import ('../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js')} OrganizationLearnerImportFormat
 * @typedef { import ('../../infrastructure/repositories/campaign-administration-repository.js')} CampaignAdministrationRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-assessment-participation-result-list-repository.js')} CampaignAssessmentParticipationResultListRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-collective-result-repository.js')} CampaignCollectiveResultRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-creator-repository.js')} CampaignCreatorRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-management-repository.js')} CampaignManagementRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-participant-activity-repository.js')} CampaignParticipantActivityRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-participation-info-repository.js')} CampaignParticipationInfoRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-participations-stats-repository.js')} CampaignParticipationsStatsRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js')} CampaignProfilesCollectionParticipationSummaryRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-report-repository.js')} CampaignReportRepository
 * @typedef { import ('../../infrastructure/repositories/division-repository.js')} DivisionRepository
 * @typedef { import ('../../infrastructure/repositories/group-repository.js')} GroupRepository
 * @typedef { import ('../../infrastructure/repositories/index.js').CampaignToJoinRepository} CampaignToJoinRepository
 * @typedef { import ('../../infrastructure/repositories/index.js').OrganizationMembershipRepository} OrganizationMembershipRepository
 * @typedef { import ('../../infrastructure/repositories/target-profile-repository.js')} TargetProfileRepository
 * @typedef { import ('../validators/campaign-update-validator.js')} CampaignUpdateValidator
 * @typedef { import ('../services/campaign-media-compliance-service')} CampaignMediaComplianceService
 */
const dependencies = {
  badgeAcquisitionRepository,
  badgeRepository,
  campaignAdministrationRepository,
  campaignAnalysisRepository,
  campaignAssessmentParticipationResultListRepository,
  campaignCollectiveResultRepository,
  campaignCreatorRepository,

  campaignManagementRepository,
  campaignParticipantActivityRepository,
  campaignParticipationInfoRepository,
  campaignParticipationRepository,
  campaignParticipationsStatsRepository,
  campaignProfilesCollectionParticipationSummaryRepository,
  campaignReportRepository,
  campaignRepository,
  campaignToJoinRepository: campaignRepositories.campaignToJoinRepository,
  campaignUpdateValidator,
  codeGenerator,
  competenceRepository,
  divisionRepository,
  groupRepository,
  knowledgeElementRepository,
  knowledgeElementSnapshotRepository,
  learningContentRepository,
  membershipRepository,
  organizationFeatureApi,
  organizationLearnerImportFormatRepository,
  organizationMembershipRepository: campaignRepositories.organizationMembershipRepository,
  organizationRepository,
  placementProfileService,
  stageRepository,
  stageCollectionRepository,
  stageAcquisitionRepository,
  targetProfileRepository: campaignRepositories.targetProfileRepository, // TODO
  tutorialRepository,
  userRepository,
  campaignMediaComplianceService,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, './statistics/'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
