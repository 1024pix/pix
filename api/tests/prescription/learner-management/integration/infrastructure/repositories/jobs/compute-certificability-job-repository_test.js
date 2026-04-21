import { ComputeCertificabilityJob } from '../../../../../../../src/prescription/learner-management/domain/models/ComputeCertificabilityJob.js';
import { computeCertificabilityJobRepository } from '../../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/compute-certificability-job-repository.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';

describe('Integration | Prescription | Application | Jobs | computeCertificabilityJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      await computeCertificabilityJobRepository.performAsync({ organizationLearnerId: 4123132 });

      // then
      await expect(ComputeCertificabilityJob.name).to.have.been.performed.withJob({
        retryLimit: 0,
        retryDelay: 0,
        retryBackoff: false,
        data: { organizationLearnerId: 4123132, correlationContext: EMPTY_CORRELATION_INFO },
      });
    });
  });
});
