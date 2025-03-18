import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as learningContentRepository from '../../../../../lib/infrastructure/repositories/learning-content-repository.js';
import * as stageCollectionRepository from '../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as tutorialRepository from '../../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import * as compareStagesAndAcquiredStages from '../../../../evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as competenceEvaluationRepository from '../../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as stageAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as stageRepository from '../../../../evaluation/infrastructure/repositories/stage-repository.js';
import * as authenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { config } from '../../../../shared/config.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as badgeForCalculationRepository from '../../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { repositories as injectedSharedRepositories } from '../../../../shared/infrastructure/repositories/index.js';
import * as organizationLearnerRepository from '../../../../shared/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import * as targetProfileRepository from '../../../target-profile/infrastructure/repositories/target-profile-repository.js';
import * as disabledPoleEmploiNotifier from '../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js';
import * as poleEmploiNotifier from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import * as campaignAnalysisRepository from '../../infrastructure/repositories/campaign-analysis-repository.js';
import * as campaignAssessmentParticipationRepository from '../../infrastructure/repositories/campaign-assessment-participation-repository.js';
import * as campaignAssessmentParticipationResultRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-repository.js';
import * as campaignParticipationOverviewRepository from '../../infrastructure/repositories/campaign-participation-overview-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { campaignParticipationResultRepository } from '../../infrastructure/repositories/campaign-participation-result-repository.js';
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

/**
 * @typedef { import ('../../../../shared/infrastructure/repositories/area-repository.js')} AreaRepository
 * @typedef { import ('../../../../shared/infrastructure/repositories/assessment-repository.js')} AssessmentRepository
 * @typedef { import ('../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js')} BadgeAcquisitionRepository
 * @typedef { import ('../../../../shared/infrastructure/repositories/badge-for-calculation-repository.js')} BadgeForCalculationRepository
 * @typedef { import ('../../../../../evaluation/infrastructure/repositories/badge-repository.js')} BadgeRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-analysis-repository.js')} CampaignAnalysisRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-assessment-participation-repository.js')} CampaignAssessmentParticipationRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-assessment-participation-result-repository.js')} CampaignAssessmentParticipationResultRepository
 * @typedef { import ('../../infrastructure/repositories/index.js')} CampaignParticipantRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-participation-overview-repository.js')} campaignParticipationOverviewRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-participation-repository.js')} CampaignParticipationRepository
 * @typedef { import ('../../infrastructure/repositories/campaign-profile-repository.js')} CampaignProfileRepository
 * @typedef { import ('../../../campaign/infrastructure/repositories/campaign-repository.js')} CampaignRepository
 * @typedef { import ('../../../target-profile/infrastructure/repositories/target-profile-repository.js')} targetProfileRepository
 * @typedef { import ('../../../../evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js')} CompareStagesAndAcquiredStages
 * @typedef { import ('../../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js')} CompetenceEvaluationRepository
 * @typedef { import ('../../../../shared/infrastructure/repositories/competence-repository.js')} CompetenceRepository
 * @typedef { import ('../../../../shared/infrastructure/repositories/knowledge-element-repository.js')} KnowledgeElementRepository
 * @typedef { import ('../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js')} KnowledgeElementSnapshotRepository
 * @typedef { import ('../../../../../lib/infrastructure/repositories/learning-content-repository.js')} LearningContentRepository
 * @typedef { import ('../../../../../lib/infrastructure/repositories/organization-learner-repository.js')} OrganizationLearnerRepository
 * @typedef { import ('../../infrastructure/repositories/participant-result-repository.js')} ParticipantResultRepository
 * @typedef { import ('../../infrastructure/repositories/participant-results-shared-repository.js')} participantResultsSharedRepository
 * @typedef { import ('../../infrastructure/repositories/jobs/participation-result-calculation-job-repository.js')} ParticipationResultCalculationJobRepository
 * @typedef { import ('../../infrastructure/repositories/participations-for-campaign-management-repository.js')} ParticipationsForCampaignManagementRepository
 * @typedef { import ('../../infrastructure/repositories/participations-for-user-management-repository.js')} ParticipationsForUserManagementRepository
 * @typedef { import ('../../infrastructure/repositories/jobs/participation-shared-job-repository.js')} ParticipationSharedJobRepository
 * @typedef { import ('../../infrastructure/repositories/jobs/participation-started-job-repository.js')} ParticipationStartedJobRepository
 * @typedef { import ('../../infrastructure/repositories/pole-emploi-sending-repository.js')} PoleEmploiSendingRepository
 * @typedef { import ('../../../../evaluation/infrastructure/repositories/stage-acquisition-repository.js')} StageAcquisitionRepository
 * @typedef { import ('../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js')} StageCollectionRepository
 * @typedef { import ('../../../../evaluation/infrastructure/repositories/stage-repository.js')} StageRepository
 * @typedef { import ('../../../../devcomp/infrastructure/repositories/tutorial-repository.js')} TutorialRepository
 */

function requirePoleEmploiNotifier() {
  if (config.poleEmploi.pushEnabled) {
    return poleEmploiNotifier;
  } else {
    return disabledPoleEmploiNotifier;
  }
}

const dependencies = {
  areaRepository,
  authenticationMethodRepository,
  assessmentRepository,
  badgeAcquisitionRepository,
  badgeForCalculationRepository,
  badgeRepository,
  campaignRepository,
  campaignAnalysisRepository,
  campaignAssessmentParticipationRepository,
  campaignAssessmentParticipationResultRepository,
  campaignParticipantRepository: campaignRepositories.campaignParticipantRepository,
  campaignParticipationOverviewRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignProfileRepository,
  targetProfileRepository,
  compareStagesAndAcquiredStages,
  competenceEvaluationRepository,
  competenceRepository,
  knowledgeElementRepository: injectedSharedRepositories.knowledgeElementRepository,
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
  poleEmploiNotifier: requirePoleEmploiNotifier(),
  poleEmploiSendingRepository,
  stageAcquisitionRepository,
  stageCollectionRepository,
  stageRepository,
  tutorialRepository,
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
