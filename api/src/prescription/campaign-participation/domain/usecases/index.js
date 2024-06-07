import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as badgeAcquisitionRepository from '../../../../../lib/infrastructure/repositories/badge-acquisition-repository.js';
import * as campaignAnalysisRepository from '../../../../../lib/infrastructure/repositories/campaign-analysis-repository.js';
import { campaignParticipationResultRepository } from '../../../../../lib/infrastructure/repositories/campaign-participation-result-repository.js';
// TODO : use an API for this import
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as learningContentRepository from '../../../../../lib/infrastructure/repositories/learning-content-repository.js';
import * as targetProfileRepository from '../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import * as stageCollectionRepository from '../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as badgeRepository from '../../../../../src/evaluation/infrastructure/repositories/badge-repository.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as tutorialRepository from '../../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import * as competenceEvaluationRepository from '../../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import { config } from '../../../../shared/config.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as authenticationMethodRepository from '../../../../shared/infrastructure/repositories/authentication-method-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as disabledPoleEmploiNotifier from '../../infrastructure/externals/disabled-pole-emploi-notifier.js';
import * as poleEmploiNotifier from '../../infrastructure/externals/pole-emploi-notifier.js';
import * as campaignAssessmentParticipationRepository from '../../infrastructure/repositories/campaign-assessment-participation-repository.js';
import * as campaignAssessmentParticipationResultRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-repository.js';
import * as campaignParticipantRepository from '../../infrastructure/repositories/campaign-participant-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as campaignProfileRepository from '../../infrastructure/repositories/campaign-profile-repository.js';
import * as participationsForCampaignManagementRepository from '../../infrastructure/repositories/participations-for-campaign-management-repository.js';
import * as participationsForUserManagementRepository from '../../infrastructure/repositories/participations-for-user-management-repository.js';

const dependencies = {
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipantRepository,
  knowledgeElementRepository,
  campaignProfileRepository,
  assessmentRepository,
  competenceEvaluationRepository,
  learningContentRepository,
  tutorialRepository,
  campaignAnalysisRepository,
  campaignAssessmentParticipationRepository,
  campaignAssessmentParticipationResultRepository,
  campaignParticipantRepository,
  campaignParticipationRepository,
  participationsForUserManagementRepository,
  campaignParticipationResultRepository,
  campaignProfileRepository,
  campaignRepository,
  competenceEvaluationRepository,
  disabledPoleEmploiNotifier,
  knowledgeElementRepository,
  learningContentRepository,
  organizationRepository,
  participationsForCampaignManagementRepository,
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
