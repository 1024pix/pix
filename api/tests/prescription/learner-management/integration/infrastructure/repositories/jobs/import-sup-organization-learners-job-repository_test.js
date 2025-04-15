import { ImportSupOrganizationLearnersJob } from '../../../../../../../src/prescription/learner-management/domain/models/ImportSupOrganizationLearnersJob.js';
import { importSupOrganizationLearnersJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/import-sup-organization-learners-job-repository.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | importSupOrganizationLearnersJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await importSupOrganizationLearnersJobRepository.performAsync(
        new ImportSupOrganizationLearnersJob({ organizationImportId: 4123132, type: 'REPLACE', locale: 'fr' }),
      );

      // then
      await expect(ImportSupOrganizationLearnersJob.name).to.have.have.been.performed.withJob({
        retrylimit: JobRetry.FEW_RETRY.retryLimit,
        retrydelay: JobRetry.FEW_RETRY.retryDelay,
        retrybackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, type: 'REPLACE', locale: 'fr' },
      });
    });
  });
});
