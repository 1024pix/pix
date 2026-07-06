import * as learningContentRepository from '../../../../../src/prescription/shared/infrastructure/repositories/learning-content-repository.js';
import * as tutorialRepository from '../../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import * as userRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as improvementService from '../../../../evaluation/domain/services/improvement-service.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as competenceEvaluationRepository from '../../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as badgeForCalculationRepository from '../../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { auditLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import * as organizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import knowledgeElementForParticipationService from '../../../shared/domain/services/knowledge-element-for-participation-service.js';
import * as compareStagesAndAcquiredStages from '../../../stages/domain/services/stage-and-stage-acquisition-comparison-service.js';
import * as stageAcquisitionRepository from '../../../stages/infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionRepository from '../../../stages/infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../../stages/infrastructure/repositories/stage-repository.js';
import * as targetProfileRepository from '../../../target-profile/infrastructure/repositories/target-profile-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as campaignAssessmentParticipationRepository from '../../infrastructure/repositories/campaign-assessment-participation-repository.js';
import * as campaignAssessmentParticipationResultRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-repository.js';
import * as campaignParticipationOverviewRepository from '../../infrastructure/repositories/campaign-participation-overview-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { campaignParticipationResultRepository } from '../../infrastructure/repositories/campaign-participation-result-repository.js';
import * as campaignParticipationStatisticsRepository from '../../infrastructure/repositories/campaign-participation-statistics-repository.js';
import * as campaignProfileRepository from '../../infrastructure/repositories/campaign-profile-repository.js';
import { repositories as campaignRepositories } from '../../infrastructure/repositories/index.js'; // needed to includes organizationFeatureAPI from another BC
import { participationResultCalculationJobRepository } from '../../infrastructure/repositories/jobs/participation-result-calculation-job-repository.js';
import { participationSharedJobRepository } from '../../infrastructure/repositories/jobs/participation-shared-job-repository.js';
import { participationStartedJobRepository } from '../../infrastructure/repositories/jobs/participation-started-job-repository.js';
import * as participantResultRepository from '../../infrastructure/repositories/participant-result-repository.js';
import { participantResultsSharedRepository } from '../../infrastructure/repositories/participant-results-shared-repository.js';
import * as participationsForCampaignManagementRepository from '../../infrastructure/repositories/participations-for-campaign-management-repository.js';
import * as participationsForUserManagementRepository from '../../infrastructure/repositories/participations-for-user-management-repository.js';
import * as poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import * as userCampaignParticipationRepository from '../../infrastructure/repositories/user-campaign-participation-repository.js';

const dependencies = {
  areaRepository,
  improvementService,
  assessmentRepository,
  badgeAcquisitionRepository,
  badgeForCalculationRepository,
  badgeRepository,
  campaignRepository,
  campaignAssessmentParticipationRepository,
  campaignAssessmentParticipationResultRepository,
  campaignParticipantRepository: campaignRepositories.campaignParticipantRepository,
  campaignParticipationOverviewRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignParticipationStatisticsRepository,
  campaignProfileRepository,
  targetProfileRepository,
  compareStagesAndAcquiredStages,
  competenceEvaluationRepository,
  competenceRepository,
  auditLoggingJobRepository,
  featureToggles,
  knowledgeElementForParticipationService,
  knowledgeElementRepository,
  knowledgeElementSnapshotRepository,
  learningContentRepository,
  organizationLearnerRepository,
  organizationRepository,
  participantResultRepository,
  participationResultCalculationJobRepository,
  participationsForCampaignManagementRepository,
  participationsForUserManagementRepository,
  participationSharedJobRepository,
  participationStartedJobRepository,
  participantResultsSharedRepository,
  poleEmploiSendingRepository,
  userCampaignParticipationRepository,
  stageAcquisitionRepository,
  stageCollectionRepository,
  stageRepository,
  tutorialRepository,
  userRepository,
  userRecommendedTrainingRepository,
};

import { checkUserHasAccessToCampaignParticipation } from './check-user-has-access-to-campaign-participation.js';
import { deleteCampaignParticipation } from './delete-campaign-participation.js';
import { findCampaignParticipationsByOrganizationLearnerIds } from './find-campaign-participations-by-organization-learner-ids.js';
import { findCampaignParticipationsByUserId } from './find-campaign-participations-by-user-id.js';
import { findCampaignParticipationsForUserManagement } from './find-campaign-participations-for-user-management.js';
import { findPaginatedParticipationsForCampaignManagement } from './find-paginated-participations-for-campaign-management.js';
import { findUserAnonymisedCampaignAssessments } from './find-user-anonymised-campaign-assessments.js';
import { findUserCampaignParticipationOverviews } from './find-user-campaign-participation-overviews.js';
import { getCampaignAssessmentParticipation } from './get-campaign-assessment-participation.js';
import { getCampaignAssessmentParticipationResult } from './get-campaign-assessment-participation-result.js';
import { getCampaignParticipationStatistics } from './get-campaign-participation-statistics.js';
import { getCampaignParticipationsForOrganizationLearner } from './get-campaign-participations-for-organization-learner.js';
import { getCampaignProfile } from './get-campaign-profile.js';
import { getPoleEmploiSendings } from './get-pole-emploi-sendings.js';
import { getResultLevelsPerTubesAndCompetences } from './get-result-levels-per-tubes-and-competences.js';
import { getSharedCampaignParticipationProfile } from './get-shared-campaign-participation-profile.js';
import { getUserCampaignAssessmentResult } from './get-user-campaign-assessment-result.js';
import { getUserCampaignParticipationToCampaign } from './get-user-campaign-participation-to-campaign.js';
import { hasCampaignParticipations } from './has-campaign-participations.js';
import { saveComputedCampaignParticipationResult } from './save-computed-campaign-participation-result.js';
import { sendSharedParticipationResultsToPoleEmploi } from './send-shared-participation-results-to-pole-emploi.js';
import { sendStartedParticipationResultsToPoleEmploi } from './send-started-participation-results-to-pole-emploi.js';
import { shareCampaignResult } from './share-campaign-result.js';
import { startCampaignParticipation } from './start-campaign-participation.js';
import { updateParticipantExternalId } from './update-participant-external-id.js';

const usecasesWithoutInjectedDependencies = {
  checkUserHasAccessToCampaignParticipation,
  deleteCampaignParticipation,
  findCampaignParticipationsByOrganizationLearnerIds,
  findCampaignParticipationsByUserId,
  findCampaignParticipationsForUserManagement,
  findPaginatedParticipationsForCampaignManagement,
  findUserAnonymisedCampaignAssessments,
  findUserCampaignParticipationOverviews,
  getCampaignAssessmentParticipationResult,
  getCampaignAssessmentParticipation,
  getCampaignParticipationsForOrganizationLearner,
  getCampaignProfile,
  getPoleEmploiSendings,
  getResultLevelsPerTubesAndCompetences,
  getSharedCampaignParticipationProfile,
  getUserCampaignAssessmentResult,
  getUserCampaignParticipationToCampaign,
  hasCampaignParticipations,
  saveComputedCampaignParticipationResult,
  sendSharedParticipationResultsToPoleEmploi,
  sendStartedParticipationResultsToPoleEmploi,
  shareCampaignResult,
  startCampaignParticipation,
  updateParticipantExternalId,
  getCampaignParticipationStatistics,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
