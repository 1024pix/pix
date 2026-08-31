import { expect } from 'chai';

import { ValidateGenericFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ValidateGenericFileJob.js';
import { validateGenericFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-generic-file-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateGenericFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateGenericFileJobRepository.performAsync(
        new ValidateGenericFileJob({ organizationImportId: 4123132 }),
      );

      // then
      await expect(ValidateGenericFileJob.name).to.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
