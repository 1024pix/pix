import * as tutorialRepository from '../../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import * as userRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as improvementService from '../../../../evaluation/domain/services/improvement-service.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as accessCodeGenerator from '../../../../shared/domain/services/access-code-generator.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import * as accessCodeRepository from '../../../../shared/infrastructure/repositories/access-code-repository.js';
import { adminMemberRepository } from '../../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as badgeForCalculationRepository from '../../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { auditLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as membershipRepository from '../../../../team/infrastructure/repositories/membership.repository.js';
import * as campaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as organizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import knowledgeElementForParticipationService from '../../../shared/domain/services/knowledge-element-for-participation-service.js';
import * as learningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as stageAcquisitionRepository from '../../../stages/infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionRepository from '../../../stages/infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../../stages/infrastructure/repositories/stage-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
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
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as divisionRepository from '../../infrastructure/repositories/division-repository.js';
import * as groupRepository from '../../infrastructure/repositories/group-repository.js';
import { repositories as campaignRepositories } from '../../infrastructure/repositories/index.js';
import * as knowledgeElementSnapshotRepository from '../../infrastructure/repositories/knowledge-element-snapshot-repository.js';

const dependencies = {
  knowledgeElementForParticipationService,
  assessmentRepository,
  adminMemberRepository,
  badgeForCalculationRepository,
  badgeAcquisitionRepository,
  badgeRepository,
  campaignAdministrationRepository,
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
  accessCodeGenerator,
  competenceRepository,
  improvementService,
  divisionRepository,
  auditLoggingJobRepository,
  featureToggles,
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
  accessCodeRepository,
  stageCollectionRepository,
  stageAcquisitionRepository,
  targetProfileRepository: campaignRepositories.targetProfileRepository, // TODO
  tutorialRepository,
  userRepository,
  userRecommendedTrainingRepository,
};

import { archiveCampaign } from './archive-campaign.js';
import { archiveCampaigns } from './archive-campaigns.js';
import { computeCampaignCollectiveResult } from './compute-campaign-collective-result.js';
import { createCampaign } from './create-campaign.js';
import { createCampaigns } from './create-campaigns.js';
import { deleteCampaigns } from './delete-campaigns.js';
import { findActiveCampaignIdsByOrganization } from './find-active-campaign-ids-by-organization.js';
import { findAssessmentParticipationResultList } from './find-assessment-participation-result-list.js';
import { findCampaignProfilesCollectionParticipationSummaries } from './find-campaign-profiles-collection-participation-summaries.js';
import { findCampaignSkillIdsForCampaignParticipations } from './find-campaign-skill-ids-for-campaign-participations.js';
import { findPaginatedCampaignManagements } from './find-paginated-campaign-managements.js';
import { findPaginatedCampaignParticipantActivities } from './find-paginated-campaign-participant-activities.js';
import { findPaginatedFilteredOrganizationCampaigns } from './find-paginated-filtered-organization-campaigns.js';
import { findPaginatedOrganizationCampaignSummaries } from './find-paginated-organization-campaign-summaries.js';
import { getCampaign } from './get-campaign.js';
import { getCampaignByCode } from './get-campaign-by-code.js';
import { getCampaignManagement } from './get-campaign-management.js';
import { getCampaignOfCampaignParticipation } from './get-campaign-of-campaign-participation.js';
import { getCampaignParticipations } from './get-campaign-participations.js';
import { getParticipantsDivision } from './get-participants-division.js';
import { getParticipantsGroup } from './get-participants-group.js';
import { getPresentationSteps } from './get-presentation-steps.js';
import { getResultLevelsPerTubesAndCompetences } from './get-result-levels-per-tubes-and-competences.js';
import { getTargetProfile } from './get-target-profile.js';
import { startWritingCampaignAssessmentResultsToStream } from './start-writing-campaign-assessment-results-to-stream.js';
import { startWritingCampaignProfilesCollectionResultsToStream } from './start-writing-campaign-profiles-collection-results-to-stream.js';
import { getBadgeAcquisitionsStatistics } from './statistics/get-badge-acquisitions-statistics.js';
import { getCampaignParticipationsActivityByDay } from './statistics/get-campaign-participations-activity-by-day.js';
import { getCampaignParticipationsCountByStage } from './statistics/get-campaign-participations-counts-by-stage.js';
import { getCampaignParticipationsCountsByStatus } from './statistics/get-campaign-participations-counts-by-status.js';
import { getOrganizationParticipantsStatistics } from './statistics/get-organization-participants-statistics.js';
import { getParticipationsCountByMasteryRate } from './statistics/get-participations-count-by-mastery-rate.js';
import { swapCampaignCodes } from './swap-campaign-code.js';
import { unarchiveCampaign } from './unarchive-campaign.js';
import { updateCampaign } from './update-campaign.js';
import { updateCampaignCode } from './update-campaign-code.js';
import { updateCampaignDetails } from './update-campaign-details.js';

const usecasesWithoutInjectedDependencies = {
  archiveCampaign,
  archiveCampaigns,
  computeCampaignCollectiveResult,
  createCampaign,
  createCampaigns,
  deleteCampaigns,
  findActiveCampaignIdsByOrganization,
  findAssessmentParticipationResultList,
  findCampaignProfilesCollectionParticipationSummaries,
  findCampaignSkillIdsForCampaignParticipations,
  findPaginatedCampaignManagements,
  findPaginatedCampaignParticipantActivities,
  findPaginatedFilteredOrganizationCampaigns,
  findPaginatedOrganizationCampaignSummaries,
  getCampaignByCode,
  getCampaignManagement,
  getCampaignOfCampaignParticipation,
  getCampaignParticipations,
  getCampaign,
  getParticipantsDivision,
  getParticipantsGroup,
  getPresentationSteps,
  getResultLevelsPerTubesAndCompetences,
  getTargetProfile,
  startWritingCampaignAssessmentResultsToStream,
  startWritingCampaignProfilesCollectionResultsToStream,
  swapCampaignCodes,
  unarchiveCampaign,
  updateCampaignCode,
  updateCampaignDetails,
  updateCampaign,
  getBadgeAcquisitionsStatistics,
  getCampaignParticipationsActivityByDay,
  getCampaignParticipationsCountByStage,
  getCampaignParticipationsCountsByStatus,
  getOrganizationParticipantsStatistics,
  getParticipationsCountByMasteryRate,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
