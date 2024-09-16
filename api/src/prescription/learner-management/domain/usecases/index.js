import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as userReconciliationService from '../../../../../lib/domain/services/user-reconciliation-service.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as membershipRepository from '../../../../../lib/infrastructure/repositories/membership-repository.js';
import { logErrorWithCorrelationIds } from '../../../../../src/shared/infrastructure/monitoring-tools.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import { importOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-organization-learners-job-repository.js';
import { validateOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-organization-learners-import-file-job-repository.js';
import * as organizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as organizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as supOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import { importStorage } from '../../infrastructure/storage/import-storage.js';

/**
 * @typedef {import ('../../../../../lib/infrastructure/repositories/campaign-repository.js')} CampaignRepository
 * @typedef {import ('../../infrastructure/repositories/organization-feature-repository.js')} CampaignParticipationRepository
 * @typedef {import ('../../infrastructure/storage/import-storage.js')} ImportStorage
 * @typedef {import ('../../../../../lib/infrastructure/repositories/membership-repository.js')} MembershipRepository
 * @typedef {import ('../../infrastructure/repositories/organization-learner-repository.js')} OrganizationLearnerRepository
 * @typedef {import ('../../infrastructure/repositories/organization-learner-import-format-repository.js')} OrganizationLearnerImportFormatRepository
 * @typedef {import ('../../../../shared/infrastructure/repositories/organization-repository.js')} OrganizationRepository
 * @typedef {import ('../../infrastructure/repositories/organization-import-repository.js')} OrganizationImportRepository
 * @typedef {import ('../../infrastructure/repositories/sup-organization-learner-repository.js')} SupOrganizationLearnerRepository
 * @typedef {import ('../../../../organizational-entities/application/api/organization-features-api.js')} OrganizationFeatureApi
 * @typedef {import ('../../../../../src/shared/infrastructure/utils/logger.js')} logger
 * @typedef {import ('../../../../../lib/domain/services/user-reconciliation-service.js')} UserReconciliationService
 * @typedef {import ('../../infrastructure/repositories/organization-feature-repository.js')} OrganizationFeatureRepository
 */
const dependencies = {
  campaignRepository,
  campaignParticipationRepository,
  importStorage,
  membershipRepository,
  organizationLearnerRepository,
  organizationLearnerImportFormatRepository,
  organizationRepository,
  importOrganizationLearnersJobRepository,
  validateOrganizationImportFileJobRepository,
  organizationImportRepository,
  supOrganizationLearnerRepository,
  organizationFeatureApi,
  logErrorWithCorrelationIds,
  userReconciliationService,
  organizationFeatureRepository: repositories.organizationFeatureRepository,
  logger,
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
 * @property {saveOrganizationLearnersFile} saveOrganizationLearnersFile
 * @property {sendOrganizationLearnersFile} sendOrganizationLearnersFile
 * @property {validateOrganizationLearnersFile} validateOrganizationLearnersFile
 * @property {addOrUpdateOrganizationLearners} addOrUpdateOrganizationLearners
 * @property {deleteOrganizationLearners} deleteOrganizationLearners
 * @property {dissociateUserFromOrganizationLearner} dissociateUserFromOrganizationLearner
 * @property {getOrganizationImportStatus} getOrganizationImportStatus
 * @property {getOrganizationLearnersCsvTemplate} getOrganizationLearnersCsvTemplate
 * @property {handlePayloadTooLargeError} handlePayloadTooLargeError
 * @property {importOrganizationLearnersFromSIECLECSVFormat} importOrganizationLearnersFromSIECLECSVFormat
 * @property {importSupOrganizationLearners} importSupOrganizationLearners
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
