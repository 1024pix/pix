import { ImportOrganizationLearnersJob } from '../../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnersJob.js';
import { importOrganizationLearnersJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/import-organization-learners-job-repository.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | importOrganizationLearnersJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await importOrganizationLearnersJobRepository.performAsync(
        new ImportOrganizationLearnersJob({ organizationImportId: 4123132 }),
      );

      // then
      await expect(ImportOrganizationLearnersJob.name).to.have.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132 },
      });
    });
  });
});
