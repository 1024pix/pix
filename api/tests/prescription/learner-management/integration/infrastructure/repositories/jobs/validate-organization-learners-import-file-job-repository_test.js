import { ValidateOrganizationImportFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { validateOrganizationImportFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-organization-learners-import-file-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateOrganizationImportFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateOrganizationImportFileJobRepository.performAsync(
        new ValidateOrganizationImportFileJob({ organizationImportId: 4123132 }),
      );

      // then
      await expect(ValidateOrganizationImportFileJob.name).to.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
