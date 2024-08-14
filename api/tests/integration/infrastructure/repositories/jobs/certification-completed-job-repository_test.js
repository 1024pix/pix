import { CertificationCompletedJob } from '../../../../../lib/domain/events/CertificationCompleted.js';
import { certificationCompletedJobRepository } from '../../../../../lib/infrastructure/repositories/jobs/certification-completed-job-repository.js';
import { LOCALE } from '../../../../../src/shared/domain/constants.js';
import { JobPriority } from '../../../../../src/shared/infrastructure/jobs/JobPriority.js';
import { expect } from '../../../../test-helper.js';
import { jobs } from '../../../../tooling/jobs/expect-job.js';

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
      const results = await jobs(CertificationCompletedJob.name);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.deep.contains({
        retrylimit: 10,
        retrydelay: 30,
        retrybackoff: true,
        priority: JobPriority.HIGH,
        data,
      });
    });
  });
});
