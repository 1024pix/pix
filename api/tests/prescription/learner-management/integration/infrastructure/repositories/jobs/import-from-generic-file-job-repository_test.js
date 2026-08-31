import { expect } from 'chai';

import { ImportFromGenericFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ImportFromGenericFileJob.js';
import { importFromGenericFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/import-from-generic-file-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | importFromGenericFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await importFromGenericFileJobRepository.performAsync(
        new ImportFromGenericFileJob({ organizationImportId: 4123132 }),
      );

      // then
      await expect(ImportFromGenericFileJob.name).to.have.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
