import { ImportScoCsvOrganizationLearnersJob } from '../../../../../../../src/prescription/learner-management/domain/models/ImportScoCsvOrganizationLearnersJob.js';
import { importScoCsvOrganizationLearnersJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/import-sco-csv-organization-learners-job-repository.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | importScoCsvOrganizationLearnersJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await importScoCsvOrganizationLearnersJobRepository.performAsync(
        new ImportScoCsvOrganizationLearnersJob({ organizationImportId: 4123132, locale: 'fr' }),
      );

      // then
      await expect(ImportScoCsvOrganizationLearnersJob.name).to.have.have.been.performed.withJob({
        retrylimit: JobRetry.FEW_RETRY.retryLimit,
        retrydelay: JobRetry.FEW_RETRY.retryDelay,
        retrybackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, locale: 'fr' },
      });
    });
  });
});
