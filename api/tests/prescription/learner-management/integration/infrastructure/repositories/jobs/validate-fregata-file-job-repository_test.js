import { expect } from 'chai';

import { ValidateFregataFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ValidateFregataFileJob.js';
import { validateFregataFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-fregata-file-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/jobs/default-config.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateFregataFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateFregataFileJobRepository.performAsync(
        new ValidateFregataFileJob({ organizationImportId: 4123132, locale: 'fr' }),
      );

      // then
      await expect(ValidateFregataFileJob.name).to.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: { organizationImportId: 4123132, locale: 'fr', correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
