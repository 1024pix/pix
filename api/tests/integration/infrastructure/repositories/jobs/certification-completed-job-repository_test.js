import { CertificationCompletedJob } from '../../../../../lib/domain/events/CertificationCompleted.js';
import { certificationCompletedJobRepository } from '../../../../../lib/infrastructure/repositories/jobs/certification-completed-job-repository.js';
import { LOCALE } from '../../../../../src/shared/domain/constants.js';
import { JobPriority } from '../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Integration | Repository | Jobs | CertificationCompletedJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const data = new CertificationCompletedJob({
        assessmentId: 1,
        userId: 2,
        certificationCourseId: 3,
        locale: LOCALE.FRENCH_SPOKEN,
      });

      // when
      await certificationCompletedJobRepository.performAsync(data);

      // then
      await expect(CertificationCompletedJob.name).to.have.been.performed.withJob({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        priority: JobPriority.HIGH,
        data,
      });
    });
  });
});
