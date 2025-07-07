import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as userRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import { eventLoggingJobRepository } from '../../../../identity-access-management/infrastructure/repositories/jobs/event-logging-job.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as organizationsProfileRewardRepository from '../../../../profile/infrastructure/repositories/organizations-profile-reward-repository.js';
import * as obfuscationService from '../../../../shared/domain/services/obfuscation-service.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as userReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as libOrganizationLearnerRepository from '../../../../shared/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import * as membershipRepository from '../../../../team/infrastructure/repositories/membership.repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepositoryfromBC from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as registrationOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/registration-organization-learner-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import { importCommonOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-common-organization-learners-job-repository.js';
import { importOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-organization-learners-job-repository.js';
import { importScoCsvOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-sco-csv-organization-learners-job-repository.js';
import { importSupOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-sup-organization-learners-job-repository.js';
import { validateCommonOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-common-organization-learners-import-file-job-repository.js';
import { validateCsvOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-csv-organization-learners-import-file-job-repository.js';
import { validateOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-organization-learners-import-file-job-repository.js';
import * as organizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as organizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as studentRepository from '../../infrastructure/repositories/student-repository.js';
import * as supOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import { importStorage } from '../../infrastructure/storage/import-storage.js';

/**
 * @typedef {dependencies} PrescriptionLearnerManagementDependencies
 */

const dependencies = {
  assessmentRepository,
  badgeAcquisitionRepository,
  campaignParticipationRepository: repositories.campaignParticipationRepository,
  campaignParticipationRepositoryfromBC,
  campaignRepository,
  eventLoggingJobRepository,
  featureToggles,
  importCommonOrganizationLearnersJobRepository,
  importOrganizationLearnersJobRepository,
  importScoCsvOrganizationLearnersJobRepository,
  importStorage,
  importSupOrganizationLearnersJobRepository,
  libOrganizationLearnerRepository,
  logger,
  membershipRepository,
  obfuscationService,
  organizationFeatureApi,
  organizationFeatureRepository: repositories.organizationFeatureRepository,
  organizationImportRepository,
  organizationLearnerImportFormatRepository,
  organizationLearnerRepository,
  organizationRepository,
  organizationsProfileRewardRepository,
  placementProfileService,
  registrationOrganizationLearnerRepository,
  studentRepository,
  supOrganizationLearnerRepository,
  userRecommendedTrainingRepository,
  userReconciliationService,
  userRepository,
  validateCommonOrganizationImportFileJobRepository,
  validateCsvOrganizationImportFileJobRepository,
  validateOrganizationImportFileJobRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, './import-from-feature/'),
    ignoredFileNames: ['index.js'],
  })),
};

/**
 * @typedef PrescriptionLearnerManagementUsecases
 * @property {computeOrganizationLearnerCertificability} computeOrganizationLearnerCertificability
 * @property {saveOrganizationLearnersFile} saveOrganizationLearnersFile
 * @property {sendOrganizationLearnersFile} sendOrganizationLearnersFile
 * @property {validateOrganizationLearnersFile} validateOrganizationLearnersFile
 * @property {addOrUpdateOrganizationLearners} addOrUpdateOrganizationLearners
 * @property {deleteOrganizationLearners} deleteOrganizationLearners
 * @property {dissociateUserFromOrganizationLearner} dissociateUserFromOrganizationLearner
 * @property {getOrganizationImportStatus} getOrganizationImportStatus
 * @property {getOrganizationImport} getOrganizationImport
 * @property {getDeltaOrganizationLearnerIds} getDeltaOrganizationLearnerIds
 * @property {getOrganizationLearnersCsvTemplate} getOrganizationLearnersCsvTemplate
 * @property {handlePayloadTooLargeError} handlePayloadTooLargeError
 * @property {importOrganizationLearnersFromSIECLECSVFormat} importOrganizationLearnersFromSIECLECSVFormat
 * @property {importSupOrganizationLearners} importSupOrganizationLearners
 * @property {hasBeenLearner} hasBeenLearner
 * @property {reconcileCommonOrganizationLearner} reconcileCommonOrganizationLearner
 * @property {reconcileScoOrganizationLearnerAutomatically} reconcileScoOrganizationLearnerAutomatically
 * @property {replaceSupOrganizationLearners} replaceSupOrganizationLearners
 * @property {updateOrganizationLearnerImportFormats} updateOrganizationLearnerImportFormats
 * @property {updateStudentNumber} updateStudentNumber
 * @property {uploadCsvFile} uploadCsvFile
 * @property {uploadSiecleFile} uploadSiecleFile
 * @property {validateCsvFile} validateCsvFile
 * @property {validateSiecleXmlFile} validateSiecleXmlFile
 */

/**
 * @type {PrescriptionLearnerManagementUsecases}
 */
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
