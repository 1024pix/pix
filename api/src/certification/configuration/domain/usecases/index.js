import { calibrateConsolidatedFramework } from './calibrate-consolidated-framework.js';
import { catchingUpCandidateReconciliation } from './catching-up-candidate-reconciliation.js';
import { createConsolidatedFramework } from './create-consolidated-framework.js';
import { createFlashAssessmentConfiguration } from './create-flash-assessment-configuration.js';
import { exportScoWhitelist } from './export-sco-whitelist.js';
import { findComplementaryCertifications } from './find-complementary-certifications.js';
import { getActiveFlashAssessmentConfiguration } from './get-active-flash-assessment-configuration.js';
import { getCurrentConsolidatedFramework } from './get-current-consolidated-framework.js';
import { importScoWhitelist } from './import-sco-whitelist.js';
import { searchAttachableTargetProfiles } from './search-attachable-target-profiles.js';

const usecases = {
  calibrateConsolidatedFramework,
  catchingUpCandidateReconciliation,
  createConsolidatedFramework,
  createFlashAssessmentConfiguration,
  exportScoWhitelist,
  findComplementaryCertifications,
  getActiveFlashAssessmentConfiguration,
  getCurrentConsolidatedFramework,
  importScoWhitelist,
  searchAttachableTargetProfiles,
};

export { usecases };
