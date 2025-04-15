import { ImportCommonOrganizationLearnersJob } from '../../../../../../../src/prescription/learner-management/domain/models/ImportCommonOrganizationLearnersJob.js';
import { importCommonOrganizationLearnersJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/import-common-organization-learners-job-repository.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | importCommonOrganizationLearnersJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await importCommonOrganizationLearnersJobRepository.performAsync(
        new ImportCommonOrganizationLearnersJob({ organizationImportId: 4123132 }),
      );

      // then
      await expect(ImportCommonOrganizationLearnersJob.name).to.have.have.been.performed.withJob({
        retrylimit: JobRetry.FEW_RETRY.retryLimit,
        retrydelay: JobRetry.FEW_RETRY.retryDelay,
        retrybackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132 },
      });
    });
  });
});
