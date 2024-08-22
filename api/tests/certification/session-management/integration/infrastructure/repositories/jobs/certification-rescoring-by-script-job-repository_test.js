import { CertificationRescoringByScriptJob } from '../../../../../../../src/certification/session-management/domain/models/CertificationRescoringByScriptJob.js';
import { certificationRescoringByScriptJobRepository } from '../../../../../../../src/certification/session-management/infrastructure/repositories/jobs/certification-rescoring-by-script-job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Certification | Infrastructure | Repository | Jobs | certificationRescoringByScriptJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // when
      const certificationRescoringByScriptJob = new CertificationRescoringByScriptJob({
        certificationCourseId: 777,
      });

      await certificationRescoringByScriptJobRepository.performAsync(certificationRescoringByScriptJob);

      // then
      await expect(CertificationRescoringByScriptJob.name).to.have.been.performed.withJob({
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data: {
          certificationCourseId: 777,
        },
      });
    });
  });
});
