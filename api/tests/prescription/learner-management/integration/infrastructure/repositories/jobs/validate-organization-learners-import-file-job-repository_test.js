import { ValidateOrganizationImportFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { validateOrganizationImportFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-organization-learners-import-file-job-repository.js';
import { JobExpireIn } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
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
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data: { organizationImportId: 4123132 },
      });
    });
  });
});
