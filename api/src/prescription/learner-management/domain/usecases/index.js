import { addOrUpdateOrganizationLearners } from './add-or-update-organization-learners.js';
import { anonymizeUser } from './anonymize-user.js';
import { computeOrganizationLearnerCertificability } from './compute-organization-learner-certificability.js';
import { deleteOrganizationLearners } from './delete-organization-learners.js';
import { dissociateUserFromOrganizationLearner } from './dissociate-user-from-organization-learner.js';
import { findOrganizationLearnersBeforeImportFeature } from './find-organization-learners-before-import-feature.js';
import { getDeltaOrganizationLearnerIds } from './get-delta-organization-learner-ids.js';
import { getOrganizationImport } from './get-organization-import.js';
import { getOrganizationImportStatus } from './get-organization-import-status.js';
import { getOrganizationLearnersCsvTemplate } from './get-organization-learners-csv-template.js';
import { handlePayloadTooLargeError } from './handle-payload-too-large-error.js';
import { hasBeenLearner } from './has-been-learner.js';
import { saveOrganizationLearnersFile } from './import-from-feature/save-organization-learners-file.js';
import { sendOrganizationLearnersFile } from './import-from-feature/send-organization-learners-file.js';
import { validateOrganizationLearnersFile } from './import-from-feature/validate-organization-learners-file.js';
import { importOrganizationLearnersFromSIECLECSVFormat } from './import-organization-learners-from-siecle-csv-format.js';
import { importSupOrganizationLearners } from './import-sup-organization-learners.js';
import { reconcileCommonOrganizationLearner } from './reconcile-common-organization-learner.js';
import { reconcileScoOrganizationLearnerAutomatically } from './reconcile-sco-organization-learner-automatically.js';
import { reconcileScoOrganizationLearnerManually } from './reconcile-sco-organization-learner-manually.js';
import { reconcileSupOrganizationLearner } from './reconcile-sup-organization-learner.js';
import { updateOrganizationLearnerImportFormats } from './update-organization-learner-import-formats.js';
import { updateOrganizationLearnerName } from './update-organization-learner-name.js';
import { updateStudentNumber } from './update-student-number.js';
import { uploadCsvFile } from './upload-csv-file.js';
import { uploadSiecleFile } from './upload-siecle-file.js';
import { validateCsvFile } from './validate-csv-file.js';
import { validateSiecleXmlFile } from './validate-siecle-xml-file.js';

const usecases = {
  saveOrganizationLearnersFile,
  sendOrganizationLearnersFile,
  validateOrganizationLearnersFile,
  addOrUpdateOrganizationLearners,
  anonymizeUser,
  computeOrganizationLearnerCertificability,
  deleteOrganizationLearners,
  dissociateUserFromOrganizationLearner,
  findOrganizationLearnersBeforeImportFeature,
  getDeltaOrganizationLearnerIds,
  getOrganizationImportStatus,
  getOrganizationImport,
  getOrganizationLearnersCsvTemplate,
  handlePayloadTooLargeError,
  hasBeenLearner,
  importOrganizationLearnersFromSIECLECSVFormat,
  importSupOrganizationLearners,
  reconcileCommonOrganizationLearner,
  reconcileScoOrganizationLearnerAutomatically,
  reconcileScoOrganizationLearnerManually,
  reconcileSupOrganizationLearner,
  updateOrganizationLearnerImportFormats,
  updateOrganizationLearnerName,
  updateStudentNumber,
  uploadCsvFile,
  uploadSiecleFile,
  validateCsvFile,
  validateSiecleXmlFile,
};

export { usecases };
