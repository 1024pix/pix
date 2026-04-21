import sinon from 'sinon';

import { LcmsCreateReleaseJob } from '../../../../../src/learning-content/domain/models/LcmsCreateReleaseJob.js';
import { scheduleCreateLearningContentReleaseJob } from '../../../../../src/learning-content/domain/usecases/schedule-create-learning-content-release-job.js';

describe('Learning Content | Unit | Domain | Usecases | Schedule Create Learning Content Release Job', function () {
  it('should use repository to schedule create learning content release job', async function () {
    // given
    const userId = 1234;
    const lcmsCreateReleaseJobRepository = { performAsync: sinon.stub() };

    // when
    await scheduleCreateLearningContentReleaseJob({ userId, lcmsCreateReleaseJobRepository });

    // then
    expect(lcmsCreateReleaseJobRepository.performAsync).to.have.been.calledOnce;
    expect(lcmsCreateReleaseJobRepository.performAsync).to.have.been.calledWithExactly(
      new LcmsCreateReleaseJob({ userId }),
    );
  });
});
