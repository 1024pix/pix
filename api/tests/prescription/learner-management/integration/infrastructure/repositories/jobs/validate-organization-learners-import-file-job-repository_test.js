import { ValidateOrganizationImportFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { validateOrganizationImportFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-organization-learners-import-file-job-repository.js';
import {
  JobExpireIn,
  JobRetry,
} from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateOrganizationImportFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateOrganizationImportFileJobRepository.performAsync(
        new ValidateOrganizationImportFileJob({ organizationImportId: 4123132 }),
      );

      // then
      await expect(ValidateOrganizationImportFileJob.name).to.have.been.performed.withJob({
        expirein: JobExpireIn.HIGH,
        retrylimit: JobRetry.FEW_RETRY.retryLimit,
        retrydelay: JobRetry.FEW_RETRY.retryDelay,
        retrybackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132 },
      });
    });
  });
});
