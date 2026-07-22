import * as userRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as obfuscationService from '../../../../identity-access-management/domain/services/obfuscation-service.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as organizationsProfileRewardRepository from '../../../../profile/infrastructure/repositories/organizations-profile-reward-repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as userReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { auditLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as studentRepository from '../../../../shared/infrastructure/repositories/student-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import * as membershipRepository from '../../../../team/infrastructure/repositories/membership.repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepositoryFromBC from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as libOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as registrationOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/registration-organization-learner-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { repositories } from '../../infrastructure/repositories/index.js';
import { importFromFregataJobRepository } from '../../infrastructure/repositories/jobs/import-from-fregata-job-repository.js';
import { importFromGenericFileJobRepository } from '../../infrastructure/repositories/jobs/import-from-generic-file-job-repository.js';
import { importFromSiecleJobRepository } from '../../infrastructure/repositories/jobs/import-from-siecle-job-repository.js';
import { importFromSupJobRepository } from '../../infrastructure/repositories/jobs/import-from-sup-job-repository.js';
import { validateFregataFileJobRepository } from '../../infrastructure/repositories/jobs/validate-fregata-file-job-repository.js';
import { validateGenericFileJobRepository } from '../../infrastructure/repositories/jobs/validate-generic-file-job-repository.js';
import { validateSiecleFileJobRepository } from '../../infrastructure/repositories/jobs/validate-siecle-file-job-repository.js';
import { validateSupFileJobRepository } from '../../infrastructure/repositories/jobs/validate-sup-file-job-repository.js';
import * as organizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as organizationLearnerFilterRepository from '../../infrastructure/repositories/organization-learner-filter-repository.js';
import * as organizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as supOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import { importStorage } from '../../infrastructure/storage/import-storage.js';

/**
 * @typedef {dependencies} PrescriptionLearnerManagementDependencies
 */

const dependencies = {
  assessmentRepository,
  badgeAcquisitionRepository,
  campaignParticipationRepository: repositories.campaignParticipationRepository,
  campaignParticipationRepositoryFromBC,
  campaignRepository,
  auditLoggingJobRepository,
  featureToggles,
  importFromGenericFileJobRepository,
  importFromSiecleJobRepository,
  importFromFregataJobRepository,
  importStorage,
  importFromSupJobRepository,
  libOrganizationLearnerRepository,
  logger,
  membershipRepository,
  obfuscationService,
  organizationFeatureApi,
  organizationFeatureRepository: repositories.organizationFeatureRepository,
  organizationImportRepository,
  organizationLearnerFilterRepository,
  organizationLearnerImportFormatRepository,
  organizationLearnerRepository,
  organizationRepository,
  organizationsProfileRewardRepository,
  userReconciliationService,
  placementProfileService,
  registrationOrganizationLearnerRepository,
  studentRepository,
  supOrganizationLearnerRepository,
  userRecommendedTrainingRepository,
  userRepository,
  validateGenericFileJobRepository,
  validateFregataFileJobRepository,
  validateSupFileJobRepository,
  validateSiecleFileJobRepository,
};

import { anonymizeUser } from './anonymize-user.js';
import { computeOrganizationLearnerCertificability } from './compute-organization-learner-certificability.js';
import { deleteOrganizationLearners } from './delete-organization-learners.js';
import { dissociateUserFromOrganizationLearner } from './dissociate-user-from-organization-learner.js';
import { findAllOrganizationLearnerImportFormats } from './find-all-organization-learner-import-format.js';
import { findOrganizationLearnersBeforeImportFeature } from './find-organization-learners-before-import-feature.js';
import { getDeltaOrganizationLearnerIds } from './get-delta-organization-learner-ids.js';
import { getOrganizationImport } from './get-organization-import.js';
import { getOrganizationImportStatus } from './get-organization-import-status.js';
import { getOrganizationLearnerFilters } from './get-organization-learner-filters.js';
import { getOrganizationLearnersCsvTemplate } from './get-organization-learners-csv-template.js';
import { handlePayloadTooLargeError } from './handle-payload-too-large-error.js';
import { hasBeenLearner } from './has-been-learner.js';
import { sendOrganizationLearnersFile } from './import-from-feature/send-organization-learners-file.js';
import { importLearnersFromFregataFile } from './import-learners/import-learners-from-fregata-file.js';
import { importLearnersFromGenericFile } from './import-learners/import-learners-from-generic-file.js';
import { importLearnersFromSiecleFile } from './import-learners/import-learners-from-siecle-file.js';
import { importLearnersFromSupFile } from './import-learners/import-learners-from-sup-file.js';
import { reconcileCommonOrganizationLearner } from './reconcile-common-organization-learner.js';
import { reconcileScoOrganizationLearnerAutomatically } from './reconcile-sco-organization-learner-automatically.js';
import { reconcileScoOrganizationLearnerManually } from './reconcile-sco-organization-learner-manually.js';
import { reconcileSupOrganizationLearner } from './reconcile-sup-organization-learner.js';
import { saveOrganizationLearnerImportFormats } from './save-organization-learner-import-formats.js';
import { updateOrganizationLearnerName } from './update-organization-learner-name.js';
import { updateStudentNumber } from './update-student-number.js';
import { uploadCsvFile } from './upload-csv-file.js';
import { uploadSiecleFile } from './upload-siecle-file.js';
import { validateFregataFile } from './validate-learners-file/validate-fregata-file.js';
import { validateGenericFile } from './validate-learners-file/validate-generic-file.js';
import { validateSiecleFile } from './validate-learners-file/validate-siecle-file.js';
import { validateSupFile } from './validate-learners-file/validate-sup-file.js';

const usecasesWithoutInjectedDependencies = {
  importLearnersFromGenericFile,
  sendOrganizationLearnersFile,
  validateOrganizationLearnersFile: validateGenericFile,
  importLearnersFromSiecleFile,
  anonymizeUser,
  computeOrganizationLearnerCertificability,
  deleteOrganizationLearners,
  dissociateUserFromOrganizationLearner,
  findAllOrganizationLearnerImportFormats,
  getOrganizationLearnerFilters,
  findOrganizationLearnersBeforeImportFeature,
  getDeltaOrganizationLearnerIds,
  getOrganizationImportStatus,
  getOrganizationImport,
  getOrganizationLearnersCsvTemplate,
  handlePayloadTooLargeError,
  hasBeenLearner,
  importLearnersFromFregataFile,
  importLearnersFromSupFile,
  reconcileCommonOrganizationLearner,
  reconcileScoOrganizationLearnerAutomatically,
  reconcileScoOrganizationLearnerManually,
  reconcileSupOrganizationLearner,
  saveOrganizationLearnerImportFormats,
  updateOrganizationLearnerName,
  updateStudentNumber,
  uploadCsvFile,
  uploadSiecleFile,
  validateFregataFile,
  validateSupFile,
  validateSiecleFile,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
