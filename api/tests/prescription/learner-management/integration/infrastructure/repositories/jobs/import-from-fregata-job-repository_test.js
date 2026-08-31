import { expect } from 'chai';

import { ImportFromFregataJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ImportFromFregataJob.js';
import { importFromFregataJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/import-from-fregata-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | importFromFregataJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await importFromFregataJobRepository.performAsync(
        new ImportFromFregataJob({ organizationImportId: 4123132, locale: 'fr' }),
      );

      // then
      await expect(ImportFromFregataJob.name).to.have.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, locale: 'fr', correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
