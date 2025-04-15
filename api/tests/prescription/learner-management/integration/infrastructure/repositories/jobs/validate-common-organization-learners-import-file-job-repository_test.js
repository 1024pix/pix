import { ValidateCommonOrganizationImportFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/ValidateCommonOrganizationImportFileJob.js';
import { validateCommonOrganizationImportFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-common-organization-learners-import-file-job-repository.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateCommonOrganizationImportFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateCommonOrganizationImportFileJobRepository.performAsync(
        new ValidateCommonOrganizationImportFileJob({ organizationImportId: 4123132 }),
      );

      // then
      await expect(ValidateCommonOrganizationImportFileJob.name).to.have.been.performed.withJob({
        retrylimit: JobRetry.FEW_RETRY.retryLimit,
        retrydelay: JobRetry.FEW_RETRY.retryDelay,
        retrybackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132 },
      });
    });
  });
});
