import { expect } from 'chai';

import { ValidateSiecleFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ValidateSiecleFileJob.js';
import { validateSiecleFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-siecle-file-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/jobs/default-config.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateSiecleFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateSiecleFileJobRepository.performAsync(new ValidateSiecleFileJob({ organizationImportId: 4123132 }));

      // then
      await expect(ValidateSiecleFileJob.name).to.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
