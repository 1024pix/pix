import { SUP_IMPORT_TYPES } from '../../../../../../../src/prescription/learner-management/domain/constants.js';
import { ValidateSupFileJob } from '../../../../../../../src/prescription/learner-management/domain/models/jobs/ValidateSupFileJob.js';
import { validateSupFileJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/validate-sup-file-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Prescription | Infrastructure | Repository | Jobs | validateSupFileJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await validateSupFileJobRepository.performAsync(
        new ValidateSupFileJob({ organizationImportId: 4123132, type: SUP_IMPORT_TYPES.REPLACE_STUDENT, locale: 'fr' }),
      );

      // then
      await expect(ValidateSupFileJob.name).to.have.been.performed.withJob({
        retryLimit: JobRetry.FEW_RETRY.retryLimit,
        retryDelay: JobRetry.FEW_RETRY.retryDelay,
        retryBackoff: JobRetry.FEW_RETRY.retryBackoff,
        data: {
          organizationImportId: 4123132,
          type: SUP_IMPORT_TYPES.REPLACE_STUDENT,
          locale: 'fr',
          correlationContext: EMPTY_CORRELATION_INFO,
        },
      });
    });
  });
});
