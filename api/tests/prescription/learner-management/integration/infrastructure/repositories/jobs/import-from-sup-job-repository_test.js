import { expect } from 'chai';

import { ImportFromSupJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ImportFromSupJob.js';
import { importFromSupJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/import-from-sup-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | importFromSupJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await importFromSupJobRepository.performAsync(
        new ImportFromSupJob({ organizationImportId: 4123132, type: 'REPLACE', locale: 'fr' }),
      );

      // then
      await expect(ImportFromSupJob.name).to.have.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: {
          organizationImportId: 4123132,
          type: 'REPLACE',
          locale: 'fr',
          correlationContext: EMPTY_CORRELATION_INFO,
        },
      });
    });
  });
});
