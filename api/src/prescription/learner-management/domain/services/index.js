import * as userRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as organizationsProfileRewardRepository from '../../../../profile/infrastructure/repositories/organizations-profile-reward-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { auditLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as campaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as organizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import { deleteOrganizationLearnersService } from './delete-organization-learners-service.js';

const dependencies = {
  assessmentRepository,
  auditLoggingJobRepository,
  badgeAcquisitionRepository,
  campaignParticipationRepository,
  organizationLearnerRepository,
  organizationLearnerImportFormatRepository,
  organizationsProfileRewardRepository,
  userRecommendedTrainingRepository,
};

const servicesWithoutInjectedDependencies = {
  deleteOrganizationLearnersService,
};

export const services = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);
