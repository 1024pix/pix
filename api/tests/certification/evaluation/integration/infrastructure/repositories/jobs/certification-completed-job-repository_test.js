import { CertificationCompletedJob } from '../../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { certificationCompletedJobRepository } from '../../../../../../../src/certification/evaluation/infrastructure/repositories/jobs/certification-completed-job-repository.js';
import { FRENCH_SPOKEN } from '../../../../../../../src/shared/domain/services/locale-service.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobPriority } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

describe('Integration | Repository | Jobs | CertificationCompletedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new CertificationCompletedJob({
        certificationCourseId: 3,
        locale: FRENCH_SPOKEN,
      });

      // when
      await certificationCompletedJobRepository.performAsync(data);

      // then
      await expect(CertificationCompletedJob.name).to.have.been.performed.withJob({
        retryLimit: 2,
        retryDelay: 30,
        retryBackoff: true,
        priority: JobPriority.HIGH,
        data: {
          ...data,
          correlationContext: EMPTY_CORRELATION_INFO,
        },
      });
    });
  });
});
