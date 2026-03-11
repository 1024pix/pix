import { UpdateCombineCourseJob } from '../../../../../../src/quest/domain/models/UpdateCombinedCourseJob.js';
import { updateCombinedCourseJobRepository } from '../../../../../../src/quest/infrastructure/repositories/jobs/update-combined-course-job-repository.js';
import { expect } from '../../../../../test-helper.js';

describe('Integration | Prescription | Application | Jobs | updateCombinedCourseJobRepository', function () {
  describe('#performAsync', function () {
    it('publish a job', async function () {
      // given
      const userId = 4123132;
      const moduleId = 'module-1';

      // when
      await updateCombinedCourseJobRepository.performAsync({ userId, moduleId });

      // then
      await expect(UpdateCombineCourseJob.name).to.have.been.performed.withJob({
        retrylimit: 0,
        retrydelay: 0,
        retrybackoff: false,
        data: {
          userId,
          moduleId,
          correlationContext: {
            user_id: '-',
          },
        },
      });
    });
  });
});
