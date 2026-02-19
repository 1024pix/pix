import { ValidateCsvOrganizationImportFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/ValidateCsvOrganizationImportFileJob.js';
import { validateCsvOrganizationImportFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-csv-organization-learners-import-file-job-repository.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateCsvOrganizationImportFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateCsvOrganizationImportFileJobRepository.performAsync(
        new ValidateCsvOrganizationImportFileJob({ organizationImportId: 4123132, type: 'REPLACE', locale: 'fr' }),
      );

      // then
      await expect(ValidateCsvOrganizationImportFileJob.name).to.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, type: 'REPLACE', locale: 'fr' },
      });
    });
  });
});
